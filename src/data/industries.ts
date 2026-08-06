// 業種別LPのテキスト定義（19業種を同じ形で並べる）。
//
// 【正本】各業種のコピーの正本は knowledge/industry-copy/{slug}.md。
//         このファイルはそれを実装用に構造化しただけのもので、文言は一字一句同じにする。
// 【文体】knowledge/manuals/tone-manner.md。業種別LPは英語アイブロウを使わない・
//         見出しや箇条書きに句点を付けない・カード内は体言止め、などトップLPの流儀に合わせる。
// 【構成】knowledge/lp-structure-research.md の承認済み11セクション。
//         hero / challenges / education / solution / transparency / after /
//         process / profile（トップの ProfileSection を再利用）/ midCta / faq / finalCta
// 【追加手順】knowledge/manuals/coding-manual.md を参照。

/** 段落＝原稿の1行を1要素にした配列。改行位置を原稿どおりに保つ（端末幅ではbudouxが更に折る） */
export type Paragraph = string[];

/** 見出しは意味の切れ目で割った行の配列。1行10〜20字（上限24字） */
export type Heading = string[];

export interface IndustryMeta {
  /** <title> */
  title: string;
  /** meta description */
  description: string;
  /** OGP画像に焼くテキスト（ページには描画しない） */
  ogpLines: string[];
}

/**
 * セクションに添える画像。
 * ファイルは public/industry/ に置く（命名は {slug}-{セクション}.webp）。
 * side は本文から見た画像の位置。ページ全体で 右→左→右→左 と交互にする。
 * **ファイルがまだ無いときは画像なしで描画される**（ビルド時に存在を確認する）。
 */
export interface SectionImage {
  file: string;
  alt: string;
  side: "left" | "right";
}

export interface IndustryHero {
  /**
   * メインキャッチ。改行位置は演出そのもの。
   * budouxやレスポンシブの都合で行を結合させない（1行=1ブロック要素で描画する）。
   */
  mainCatch: Heading;
  /** メインキャッチ直下の1行。「誰向け・何をするか」を引き取る */
  subCatch: string;
  /** 説明文 */
  subCopy: Paragraph[];
  primaryCta: string;
  secondaryCta: string;
  microCopy: string[];
  image: { file: string; alt: string; flip: boolean };
}

export interface IndustryChallenges {
  heading: Heading;
  checklist: string[];
  closing: Paragraph;
  emphasis: string[];
  image?: SectionImage;
}

export interface IndustryEducation {
  heading: Heading;
  body: Paragraph[];
  subHeading: Heading;
  subBody: Paragraph[];
  /** 統計の出典注記。削らない（数値の帰属を誤読させないための記載） */
  note: string;
  emphasis: string[];
  image?: SectionImage;
}

export interface Deliverable {
  title: string;
  /** 体言止め・句点なし・1行に収まる長さ */
  body: string;
}

export interface IndustrySolution {
  heading: Heading;
  body: Paragraph[];
  deliverablesHeading: string;
  /** グリッドの枠が埋まる数にする（3列なら3・6・9個） */
  deliverables: Deliverable[];
  emphasis: string[];
  image?: SectionImage;
}

export interface FlowRow {
  label: string;
  body: string;
}

export interface IndustryTransparency {
  heading: Heading;
  lead: Paragraph;
  /** PCは2列表（工程列は中央寄せ・内容列は左寄せ）、SPは縦フロー */
  flowHeader: [string, string];
  flow: FlowRow[];
  emphasisBlock: Paragraph;
  closing: Paragraph;
  emphasis: string[];
}

/**
 * 工程フロー図の1コマ。導入前と導入後を**同じ数だけ**並べ、同じ工程が縦に揃うようにする。
 *
 * kind:
 *  normal    = 通常
 *  auto      = AIへ移る工程。導入後の段では**連続するぶんをまとめて1つのグレー枠**に描く
 *              （導入前の段では「これから人の手を離れる工程」として mute で描く）
 *  highlight = 差し色で強調（1コマだけ。人が判断するところ）
 *  positive  = 導入後に良くなったコマ。差し色の罫線＋`badge` で見せる
 *
 * **✕・◯は使わない**（2026-08-06 なおき第4レビュー。何を言っているか分からないため）。
 * 変化は導入後側だけで見せる。
 */
export interface FlowNode {
  label?: string;
  /** コマの右上に出す短いバッジ（例「自動」）。positive のコマに付ける */
  badge?: string;
  kind: "normal" | "auto" | "highlight" | "positive";
}

export interface IndustryAfter {
  heading: Heading;
  beforeTitle: string;
  afterTitle: string;
  /** 段の脇に添える「人がやる工程」の数（導入前6 → 導入後3） */
  beforeCount: string;
  afterCount: string;
  beforeSteps: FlowNode[];
  afterSteps: FlowNode[];
  /** AIへ移る工程をまとめたグレー枠の上に添える短い一言 */
  autoGroupLabel: string;
  /** 図の直下に置く1行。図から離さない */
  figureNote: string;
  body: Paragraph;
}

export interface ProcessStep {
  number: string;
  title: string;
  /** 1行に収まる長さ */
  body: string;
}

export interface IndustryProcess {
  heading: Heading;
  steps: ProcessStep[];
  /** 締めの1行。無ければ最後のSTEPで終わる（製造業v3は置かない＝FAQ Q1と重複するため） */
  closing?: string;
  emphasis: string[];
  image?: SectionImage;
}

export interface IndustryMidCta {
  heading: Heading;
  body: Paragraph;
  primaryCta: string;
  secondaryCta: string;
  microCopy: string[];
}

export interface FaqItem {
  q: string;
  a: Paragraph;
}

export interface IndustryFaq {
  heading: Heading;
  items: FaqItem[];
  emphasis: string[];
}

export interface IndustryFinalCta {
  heading: Heading;
  body: Paragraph;
  primaryCta: string;
  secondaryCta: string;
  microCopy: string[];
  materialsTitle: string;
  materials: string[];
  emphasis: string[];
}

export interface Industry {
  /** URLになる。英小文字ハイフン区切り（画像ファイル名とも一致させる） */
  slug: string;
  /** 業種の表示名 */
  name: string;
  /** CTAリンクの計測パラメータ v= の値 */
  ctaVersion: string;
  meta: IndustryMeta;
  hero: IndustryHero;
  challenges: IndustryChallenges;
  education: IndustryEducation;
  solution: IndustrySolution;
  transparency: IndustryTransparency;
  after: IndustryAfter;
  process: IndustryProcess;
  midCta: IndustryMidCta;
  faq: IndustryFaq;
  finalCta: IndustryFinalCta;
}

/**
 * CTAの位置。営業文のURLから来る ?c= トークンは track.ts が sessionStorage で貫通させる。
 * hero=セクション1 / flow=セクション9 / bottom=セクション11 / header=最小ヘッダー
 */
export type CtaPosition = "hero" | "flow" | "bottom" | "header";

/** CTAリンクを組み立てる。例: /reserve?cta=hero&v=mfg_v1 */
export function ctaUrl(
  base: string,
  page: "reserve" | "download",
  position: CtaPosition,
  version: string
): string {
  return `${base}/${page}?cta=${position}&v=${version}`;
}

const manufacturing: Industry = {
  slug: "manufacturing",
  name: "製造業",
  ctaVersion: "mfg_v1",

  meta: {
    title:
      "製造業の見積回答・案件フォローをAIで自動化｜AI業務自動化構築代行 CoreGen",
    description:
      "見積依頼・仕様書・過去案件をもとに、確認事項と見積・提案・フォロー連絡の下書きを作る仕組みを構築して納品します。価格・納期・製造可否の判断は人に残す設計。30〜300名の製造業向け。無料相談実施中。",
    ogpLines: [
      "人は増えない。それでも、見積の数は増やせる",
      "製造業向け AI業務自動化構築代行",
    ],
  },

  hero: {
    mainCatch: ["人は増えない。", "それでも、見積の数は増やせる"],
    subCatch: "製造業の見積回答・案件フォローを、AIで自動化する",
    /*
     * FVは「こういうことをします」だけを言う。限定句もAIに何をさせないかの但し書きも置かない。
     * 線引きはセクション5（transparency）が担う（正本v3 §1）。
     */
    subCopy: [
      [
        "見積依頼、仕様、数量、納期、過去の似た案件。",
        "それらをもとに、確認事項と見積・提案の下書きまでを作る仕組みを構築します。",
      ],
    ],
    primaryCta: "無料相談を予約する",
    secondaryCta: "サービス資料をダウンロード",
    microCopy: ["相談だけでも構いません。しつこい営業電話・メールはいたしません。"],
    image: {
      file: "manufacturing-hero.webp",
      alt: "製造現場のイメージ",
      flip: true,
    },
  },

  challenges: {
    heading: ["こんなことで、見積が後回しになっていませんか"],
    /* PCで1行に収める。19〜21字・読点は各行1つまで（正本v3 §2。上限30字は検品が見る） */
    checklist: [
      "見積依頼は来ているのに、回答が後回しになる",
      "価格ではなく、回答の遅さで負けた気がする",
      "過去の似た案件を探すのに、毎回時間がかかる",
      "見積の勘どころが、あの人にしか分からない",
      "FAXと紙で届いた内容を、手で打ち直している",
      "見積を出した後の追客まで、手が回らない",
    ],
    closing: [
      "原因は、担当者の腕でも人数でもありません。",
      "見積の段取りが、人の頭の中にしかないからです。",
    ],
    emphasis: ["人の頭の中にしかない"],
    image: {
      file: "manufacturing-s2.webp",
      alt: "書類が山積みになった事務机",
      side: "right",
    },
  },

  education: {
    heading: ["価格で負けるのは仕方ない。", "速さで負けるのは、もったいない"],
    body: [
      [
        "人手不足は景気で戻りません。",
        "34歳以下の製造業就業者はこの20年で384万人から258万人へ減り、",
        "技能継承がうまくいっている企業は33.3%にとどまります。",
      ],
      [
        "それでも発注する側は、速い工場を選びます。",
        "受注担当者の73.3%はいまもFAXで書類を受け取り、60.4%が手で入力しています。",
        "この入口の遅さが、そのまま回答の遅さになります。",
      ],
    ],
    subHeading: ["空いた時間は、見積と追客に戻す"],
    subBody: [
      [
        "時間が空いても、行き先を決めなければ別の作業で埋まります。",
        "私が最初に決めるのは、削った時間を誰のどの活動に戻すかです。",
        /* 代表例として挙げるだけ。何を対象にするかは無料相談でうかがってから決めるので先に絞らない */
        "戻す先として効くのは、見積回答や案件フォローのような売上に近い業務です。",
      ],
    ],
    note: "※ 2026年版ものづくり白書、およびAI inside株式会社の調査（2024年6月・製造業の受注業務担当者329名）による業界全体の統計です。当社の導入効果を示すものではありません。",
    emphasis: ["見積と追客に戻す"],
    image: {
      file: "manufacturing-s3.webp",
      alt: "工作機械が並ぶ工場",
      side: "left",
    },
  },

  solution: {
    heading: ["研修ではなく、動く仕組みを作って納品します"],
    body: [
      [
        "AIの使い方を教えて終わりにはしません。",
        "御社のメール、過去の見積、仕様書、いまの手順を材料にして、",
        "実際に業務が回る状態まで作ります。",
      ],
      /*
       * ロジックは常に ヒアリング → 設計 → 構築・納品。
       * 「最初に作るのは1業務だけ」のように提案の範囲を先に宣言しない（正本v3 §4）。
       */
      [
        "何を作るかは、無料相談でうかがった御社の状況から決めます。",
        "どの業務のどこに時間がかかっているかを一緒に整理し、",
        "御社の手順で動くAI担当者として設計し、構築して納品します。",
      ],
    ],
    deliverablesHeading: "納品するもの",
    deliverables: [
      {
        title: "現行業務フロー図",
        body: "誰が何を入力し、どこで判断し、何を出しているかを1枚に",
      },
      {
        title: "AIと人の役割設計図",
        body: "AIに任せる処理、人に残す判断、承認の手順、例外時の戻し先",
      },
      {
        title: "動くAI業務フロー",
        body: "いまのメール、Excel、共有フォルダを活かして構築",
      },
      {
        title: "運用マニュアルと操作説明",
        body: "担当者が自分で使える状態に",
      },
      {
        title: "テスト運用と効果測定",
        body: "実際の見積依頼を流し、導入前後の時間と件数を比べる",
      },
      {
        title: "時間の再配置計画",
        body: "空いた時間を、誰のどの活動に戻すかを決める",
      },
    ],
    emphasis: ["御社の状況から決めます"],
    image: {
      file: "manufacturing-s4.webp",
      alt: "書類が一つにまとまり、流れがつながった事務机",
      side: "right",
    },
  },

  transparency: {
    heading: ["AIがやること、人が決めること"],
    /* 1行目は35字前後に収める（長いとPCで折り返して2行目に数文字だけ残る。正本v3 §5） */
    lead: [
      "AIに任せると聞いて不安なのは、どこまで勝手に決めるのか分からないからです。",
      "価格と製造可否をAIが決めることは、ありません。",
    ],
    flowHeader: ["工程", "内容"],
    flow: [
      {
        label: "入力",
        body: "見積依頼、顧客情報、仕様、数量、納期、過去の似た案件",
      },
      {
        label: "AIが行う処理",
        body: "内容の整理、不足情報の洗い出し、似た案件の検索、見積・提案・確認メールの下書き",
      },
      {
        label: "人が決めること",
        body: "原価、価格、納期、製造可否、仕様",
      },
      {
        label: "出力",
        body: "社内確認用サマリー、質問事項、見積・提案のたたき、顧客への返信案、追客予定",
      },
    ],
    emphasisBlock: [
      "過去の似た案件を探す工程を、AIが肩代わりします。",
      "ここはベテランの記憶と勘に頼っていた部分です。",
      "仕組みに移せば、担当者が代わっても同じ材料が揃います。",
    ],
    closing: [
      "材料費と価格転嫁の交渉が絡む以上、価格を決めるのは人の仕事です。",
      "その判断を速くするための材料を、いつでも揃えておく。",
      "それがこの仕組みの役割です。",
    ],
    emphasis: ["価格と製造可否をAIが決めることは、ありません"],
  },

  after: {
    heading: ["導入前と導入後で、こう変わります"],
    beforeTitle: "導入前",
    afterTitle: "導入後",
    beforeCount: "人がやる工程 6",
    afterCount: "人がやる工程 3",
    beforeSteps: [
      { label: "見積依頼が届く", kind: "normal" },
      { label: "手が空くまで待つ", kind: "auto" },
      { label: "過去案件を探す", kind: "auto" },
      { label: "技術に聞いて往復", kind: "auto" },
      { label: "見積を作る", kind: "normal" },
      { label: "追客できない", kind: "normal" },
    ],
    afterSteps: [
      { label: "見積依頼が届く", kind: "normal" },
      { label: "AIが自動で受け取る", kind: "auto" },
      { label: "AIが自動で探す", kind: "auto" },
      { label: "AIが自動で不足点を洗い出す", kind: "auto" },
      { label: "判断して見積を出す", kind: "highlight" },
      { label: "追客予定が自動で並ぶ", kind: "positive", badge: "自動" },
    ],
    autoGroupLabel: "ここはAIが自動で",
    figureNote: "価格・進め方の詳細は、無料相談でご説明します。",
    body: [
      "変わるのは、担当者が何に時間を使うかです。",
      "探す、整理する、打ち直す。誰がやっても答えが同じ作業から手が離れます。",
      "代わりに、価格をどう組むか、この仕様で受けられるか、いつ出せるか。",
      "御社の担当者にしかできない判断に、時間が向きます。",
    ],
    /*
     * 「測る数字」5項目と実測の注記は 2026-08-06 第4レビューで削除。
     * 何を測るかは事前に提示せず、ヒアリングで決める（提案を先に絞らないルールと同じ）。
     */
  },

  process: {
    heading: ["進め方"],
    steps: [
      {
        number: "01",
        title: "無料相談",
        body: "いまの見積対応の流れをうかがい、どこにAIを入れられるかを整理",
      },
      {
        number: "02",
        title: "対象業務と現状の数値化",
        body: "うかがった内容から対象業務を決め、いまの件数と所要時間を測る",
      },
      {
        number: "03",
        title: "設計図と費用のご提示",
        body: "役割設計図をお見せしたうえで、費用と期間をご提示",
      },
      {
        number: "04",
        title: "構築",
        body: "いまのメール、Excel、共有フォルダを活かして組み上げる",
      },
      {
        number: "05",
        title: "操作説明とテスト運用",
        body: "実際の見積依頼を流し、使いにくいところを直す",
      },
      {
        number: "06",
        title: "効果確認",
        body: "STEP 02の数字と比べ、続ける・広げる・終えるを一緒に決める",
      },
    ],
    /*
     * 締めの1行は置かない。「価格・進め方の詳細は、無料相談でご説明します。」はFAQ Q1と
     * 同じことを言っているため v3 で削除した。STEP 06のあとはそのままプロフィールへ流す。
     */
    emphasis: ["設計図と費用のご提示"],
    image: {
      file: "manufacturing-s7.webp",
      alt: "業務の流れを一緒に書き出している手元",
      side: "left",
    },
  },

  midCta: {
    heading: ["まずは、話を聞かせてください"],
    body: [
      "いまの見積対応の流れをうかがい、AIに任せられる工程と、人に残すべき判断を切り分けます。",
      "効果が出ないと判断したときは、そのままお伝えします。",
    ],
    primaryCta: "無料相談を予約する",
    secondaryCta: "サービス資料をダウンロード",
    microCopy: ["オンラインで実施します。その場で契約を決めていただく必要はありません。"],
  },

  faq: {
    heading: ["よくある質問"],
    items: [
      {
        q: "費用はどのくらいかかりますか",
        a: [
          "対象業務の件数や、いま使っているツールで変わるため、一律の金額は出していません。",
          "無料相談でご説明します。設計図と費用をご覧いただいてから判断できますので、",
          "相談の時点で費用はかかりません。",
        ],
      },
      {
        q: "導入実績や事例の数字を見せてもらえますか",
        a: [
          "他社の削減率を御社に当てはめてお見せすることはしていません。",
          "業種も体制も違えば、結果が変わるからです。",
          "代わりに御社の現状を実測し、同じ条件で導入後と比べます。",
        ],
      },
      {
        q: "見積書や図面など、社外に出せないデータを扱いませんか",
        a: [
          "扱う範囲は構築を始める前に相談して決めます。扱わないと決めたものは仕組みに入れません。",
          "人の承認を通さずに社外へ送る仕組みも作りません。",
        ],
      },
      {
        q: "現場がITに強くありません。使えるでしょうか",
        a: [
          "いまのメール、Excel、スプレッドシート、共有フォルダを活かして作ります。",
          "覚え直す量を減らすためです。",
          "マニュアルと操作説明のうえテスト運用まで一緒に行い、使いにくいところは直します。",
        ],
      },
      {
        q: "全部AIが自動でやってくれるのですか",
        a: [
          "いいえ。価格、納期、製造可否、仕様の最終判断は人が行います。",
          "AIが担当するのは、情報の整理、不足点の洗い出し、似た案件の検索、下書きの作成までです。",
        ],
      },
    ],
    emphasis: ["御社の現状を実測"],
  },

  finalCta: {
    heading: ["まずは無料相談から"],
    body: [
      "見積依頼は今日も届いています。",
      "その1件の回答が1日速くなることが、次の受注につながることがあります。",
      "まずは、いまの見積対応の流れを聞かせてください。",
      "AIを入れるべきかどうかも含めて、正直にお答えします。",
    ],
    primaryCta: "無料相談を予約する",
    secondaryCta: "サービス資料をダウンロード",
    microCopy: [
      "相談だけでも構いません。その場での契約は不要です。",
      "しつこい営業電話・メールはいたしません。",
    ],
    materialsTitle: "資料の内容",
    materials: [
      "AIがやること、人が決めることの全体像",
      "製造業で最初に測る数字",
      "相談から効果確認までの進め方",
    ],
    emphasis: ["1日速くなる"],
  },
};

/** slug をキーにした業種の一覧。ここに足すとページが1枚増える */
export const industries: Record<string, Industry> = {
  manufacturing,
};
