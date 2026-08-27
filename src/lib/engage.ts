// engage.ts — LP内の行動（どこまで読んだか・どれだけ見ていたか・何をしたか）の計測（クライアント専用）。
//
// 【何のためにあるか】
// 既存の計測は「そのページに着いた」(trackVisit) と「CTAを押した」(trackCta) の2点しか無く、
// **何もせず帰った人が何も残さない**。「LPに来たが資料も予約も押さずに終わった」ときに、
// ヒーローだけ見て帰ったのか、最後まで読んだうえで押さなかったのかが分からない。
// この2つは打ち手が正反対（前者はファーストビュー、後者はオファー）なので、
// ここを分けられないと改善の当てどころが決まらない。
//
// 【測り方の方針】
//   - 主軸は**セクション単位の到達**。パーセントより「どのセクションで止まったか」のほうが
//     直接そのセクションを名指しできる。業種LP11個・トップLP10個の <section> には
//     **すでに id が付いている**ので、マークアップには一切手を入れない。
//   - 送信は**離脱時にまとめて1回**。スクロールのたびには送らない。
//
// 【表示速度を落とさないための約束】
//   - セクション到達は IntersectionObserver（スクロールイベントに処理を置かない）。
//   - 深度だけは scroll を見るが `{passive:true}` ＋ requestAnimationFrame で1フレーム1回に間引き、
//     ページ全体の高さはキャッシュして resize のときだけ測り直す（毎フレームの再レイアウトを避ける）。
//   - 読み込み時の追加通信はゼロ。何も起きていない間は何も実行しない。
import { trackEngage, type EngagePayload } from "./track";

/**
 * 資料DLページの到達段階（下にいくほど深い）。**順序に意味がある**＝最大値を採って記録する。
 *
 * `submit_attempt` を独立した段に置いているのが要点で、ここが最大のまま終わっている人は
 * **「送信ボタンを押したのに、成功も失敗もしていない」**＝こちら側の不具合を意味する
 * （検証で止まったなら submit_error、送信できたなら submit_ok に進むはずなので）。
 */
const STAGES = [
  "page_view",
  "form_view",
  "field_focus",
  "field_input",
  "submit_attempt",
  "submit_error",
  "submit_ok",
] as const;
export type Stage = (typeof STAGES)[number];

interface State {
  logUrl: string;
  token: string;
  page: string;
  version: string;
  sections: HTMLElement[];
  sectionIds: string[];
  reached: Set<string>;
  maxDepth: number;
  /** 現在のスクロール位置から、深度と到達済みセクションを測り直す */
  sweep: () => void;
  stageIdx: number;
  err: string;
  submits: number;
  clicked: number;
  seq: number;
  dwellMs: number;
  visibleSince: number;
  lastSentKey: string;
}

let S: State | null = null;

/** 到達したセクションのうち、**ページの並びで最も下**にあるもの。 */
function deepestSection(s: State): string {
  for (let i = s.sectionIds.length - 1; i >= 0; i--) {
    if (s.reached.has(s.sectionIds[i])) return s.sectionIds[i];
  }
  return "";
}

function pauseDwell(s: State): void {
  if (s.visibleSince) {
    s.dwellMs += performance.now() - s.visibleSince;
    s.visibleSince = 0;
  }
}

function resumeDwell(s: State): void {
  if (!s.visibleSince) s.visibleSince = performance.now();
}

/**
 * 現在の集計を送る。**タブを離れるたびに呼ばれる**（戻ってまた読んだぶんも拾うため）。
 *
 * 同じ内容を二度送らないよう、seq を除いた中身が前回と同一なら送らない。
 * これが無いと `visibilitychange`(hidden) と `pagehide` が連続で発火したときに
 * まったく同じ行が2本入る。
 */
function flush(): void {
  const s = S;
  if (!s) return;
  pauseDwell(s);
  /*
   * 送る直前に現在位置から測り直す。**これが無いと背面タブで数字が落ちる。**
   * ブラウザは背面のタブで requestAnimationFrame と IntersectionObserver を止めるので、
   * 「読んで、そのままタブを切り替えた/閉じた」という**まさに離脱そのもの**の場面で、
   * 最後のスクロールぶんの深度とセクション到達が反映されないまま送られてしまう
   * （実測: 6,416pxまでスクロールしたのに深度6%・到達0セクションで送られた）。
   * IntersectionObserver の結果は捨てず、和を取る＝下までスクロールしてから上へ戻った人も取りこぼさない。
   */
  s.sweep();
  const payload: Omit<EngagePayload, "seq"> = {
    page: s.page,
    v: s.version,
    last_section: deepestSection(s),
    sections: s.reached.size,
    depth: s.maxDepth,
    dwell: Math.round(s.dwellMs / 1000),
    clicked: s.clicked,
    stage: STAGES[s.stageIdx],
    err: s.err,
    submits: s.submits,
  };
  const key = JSON.stringify(payload);
  if (key !== s.lastSentKey) {
    s.lastSentKey = key;
    s.seq += 1;
    trackEngage(s.logUrl, s.token, { ...payload, seq: s.seq });
  }
  // 戻ってきて読み続ける可能性があるので、計測はここで終わりにしない
  if (document.visibilityState === "visible") resumeDwell(s);
}

/** CTAを押したことを記録（Layout.astro の委譲リスナーから呼ばれる）。 */
export function markCtaClick(): void {
  if (S) S.clicked = 1;
}

/**
 * 資料DLページの段階を進める。**後戻りはしない**（最大値を保つ）。
 * `detail` はエラーの種類などの短い識別子だけを受け取る。**入力値は絶対に渡さないこと。**
 */
export function markStage(stage: Stage, detail = ""): void {
  if (!S) return;
  const i = STAGES.indexOf(stage);
  if (i > S.stageIdx) S.stageIdx = i;
  if (stage === "submit_attempt") S.submits += 1;
  if (detail) S.err = detail;
}

/**
 * 計測を開始する。token が無い訪問（営業文以外から来た人）では**何も動かさない**
 * ＝誰か分からない相手の行動は記録しない。
 */
export function initEngage(opts: {
  logUrl: string;
  token: string | null;
  page: string;
  version: string;
}): void {
  if (!opts.logUrl || !opts.token || S) return;

  const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
  const s: State = {
    logUrl: opts.logUrl,
    token: opts.token,
    page: opts.page,
    version: opts.version,
    sections,
    sectionIds: sections.map((el) => el.id),
    reached: new Set(),
    maxDepth: 0,
    sweep: () => {},
    stageIdx: 0,
    err: "",
    submits: 0,
    clicked: 0,
    seq: 0,
    dwellMs: 0,
    visibleSince: document.visibilityState === "visible" ? performance.now() : 0,
    lastSentKey: "",
  };
  S = s;

  // ---- セクション到達（スクロールイベントを使わない） ----
  if (sections.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          s.reached.add((e.target as HTMLElement).id);
          io.unobserve(e.target); // 一度到達したら見張るのをやめる
        }
      },
      { threshold: 0 }
    );
    sections.forEach((el) => io.observe(el));
  }

  // ---- 最大スクロール到達率 ----
  let docH = 1;
  const measureDoc = () => {
    docH = Math.max(document.documentElement.scrollHeight, 1);
  };
  const sample = () => {
    const pct = Math.round(Math.min(100, ((window.scrollY + window.innerHeight) / docH) * 100));
    if (pct > s.maxDepth) s.maxDepth = pct;
  };
  /*
   * 現在位置から深度と到達セクションを測り直す。scroll/resize の間引き処理とは別に、
   * **離脱時（flush）にも必ず1回呼ぶ**。背面タブでは rAF も IntersectionObserver も
   * 止まるので、最後のスクロールぶんがここでしか拾えない。
   * DOMを読むのは離脱時とスクロール後のフレームだけなので、常時の負荷にはならない。
   */
  s.sweep = () => {
    measureDoc();
    sample();
    const bottom = window.innerHeight;
    for (const el of s.sections) {
      if (s.reached.has(el.id)) continue;
      // 上端が画面の下辺より上に来ていれば、そのセクションは目に入っている
      if (el.getBoundingClientRect().top < bottom) s.reached.add(el.id);
    }
    // 資料DLページのフォームも同じ理由で測り直す（背面タブでは IntersectionObserver が止まる）
    const f = document.getElementById("dl-form");
    if (f && s.stageIdx < 1 && f.getBoundingClientRect().top < bottom) markStage("form_view");
  };
  s.sweep(); // スクロールが要らない短いページは、この1回で深度100・全セクション到達になる
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        sample();
      });
    },
    { passive: true }
  );
  window.addEventListener(
    "resize",
    () => {
      measureDoc();
      sample();
    },
    { passive: true }
  );

  // ---- 資料DLページのフォーム到達・入力（値は一切見ない） ----
  const form = document.getElementById("dl-form");
  if (form) {
    if ("IntersectionObserver" in window) {
      const fio = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            markStage("form_view");
            fio.disconnect();
          }
        },
        { threshold: 0 }
      );
      fio.observe(form);
    }
    form.addEventListener("focusin", () => markStage("field_focus"), { passive: true });
    form.addEventListener(
      "input",
      (ev) => {
        // **1文字でも入ったか**だけを見る。中身も長さも読まない・送らない
        const t = ev.target as HTMLInputElement | null;
        if (t && typeof t.value === "string" && t.value.length > 0) markStage("field_input");
      },
      { passive: true }
    );
  }

  // ---- 離脱の検知 ----
  // visibilitychange(hidden) が主。iOS Safari はタブを閉じたときもアプリを背面に回したときも
  // `unload`/`beforeunload` がほぼ発火せず、**hidden だけが確実に来る**ため。
  // pagehide は bfcache とPCの遷移を拾う副系統。
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
    else resumeDwell(s);
  });
  window.addEventListener("pagehide", flush);
}
