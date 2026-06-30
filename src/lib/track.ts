// track.ts — ユニークリンク(?c=token)の取得とクリック/訪問ビーコン送信（クライアント専用）。
// measurement-plan.md §5/§12 準拠。フロントが扱うのは token のみ（会社/型/業種は台帳JOINで復元）。
// 計測は代理指標（no-cosで送りっぱなし）。GASは event 種別で clicks/downloads に振り分ける。

const TOKEN_RE = /^[A-Za-z0-9_-]{1,32}$/;

/** ?c=token を取得。取得後は sessionStorage に退避し、内部回遊（/→/download）でも保持。不正形は null。 */
export function getToken(): string | null {
  try {
    const c = new URLSearchParams(location.search).get("c");
    if (c && TOKEN_RE.test(c)) {
      sessionStorage.setItem("cg_token", c);
      return c;
    }
    const saved = sessionStorage.getItem("cg_token");
    if (saved && TOKEN_RE.test(saved)) return saved;
  } catch {
    // sessionStorage 不可（プライベートモード等）でも致命的にしない
  }
  return null;
}

/** 訪問/クリックを1回だけ no-cors ビーコンで記録（同一セッション・同一ページの再読込は抑止）。 */
export function trackVisit(logUrl: string, token: string | null, page: string): void {
  if (!logUrl || !token) return;
  const key = `cg_hit_${token}_${page}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // 抑止できなくても送信は試みる
  }
  try {
    fetch(logUrl, {
      method: "POST",
      mode: "no-cors", // GASはCORSヘッダを返さない。Content-Typeは付けない（プリフライト回避）
      keepalive: true, // 離脱直前でも送信が中断されにくい
      body: JSON.stringify({ event: "visit", token, page, ts: new Date().toISOString() }),
    });
  } catch {
    // 送信失敗は許容（代理指標）
  }
}
