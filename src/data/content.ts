// LP全テキストコンテンツ（Doc v4「9セクション集約版」準拠）

export const site = {
  title: "CoreGen｜AIで売上を最大化するAI実装研修",
  description:
    "AI導入研修から伴走支援・AI経営戦略支援まで、企業のAI実装を一気通貫で支援。単なる業務効率化で終わらせず、売上最大化にコミット。地方中小企業のための、完全成果報酬型AI伴走支援。",
};

export const nav = [
  { label: "理念", href: "#solution" },
  { label: "サービス", href: "#services" },
  { label: "選ばれる理由", href: "#features" },
  { label: "研修内容", href: "#curriculum" },
  { label: "事例", href: "#cases" },
  { label: "導入の流れ", href: "#flow" },
];

export const hero = {
  mainCatch: "AIで売上を最大化する",
  subCatch: [
    "単なる業務効率化で終わらせない",
    "空いた時間を売上に直結する仕事へ",
  ],
  subLead: "中小企業のためのAI伴走支援",
  badges: [
    { label: "AIセミナー登壇", value: "50回以上" },
    { label: "Xフォロワー", value: "15,000人超" },
    { label: "AIサロン運営中", value: "100名超" },
  ],
  primaryCta: "無料相談を予約する",
  secondaryCta: "サービス詳細資料をダウンロード",
};

export const solution = {
  eyebrow: "PHILOSOPHY",
  heading: "私の理念",
  body: [
    "私は、“単なる業務効率化”で終わらせず、“売上の最大化”にコミットします。",
    "そのために、AIを組織そのものに実装し、現場に定着させます。",
    "AI活用は、まずはAI人材の育成から。",
  ],
  flowSteps: [
    "AIで業務効率化",
    "コスト削減",
    "新規事業創出・人員再配置",
    "売上・利益の最大化",
  ],
  closing:
    "私が目指すのは、業務効率化を超えた“売上最大化”の実現です。",
};

export const profile = {
  eyebrow: "PROFILE",
  heading: "教えるのは、組織の中で売上を作ってきた人間です",
  name: "星野創吉",
  nameReading: "ほしの そうきち",
  career: [
    "近畿大学経営学部卒業後、株式会社フィナンシャルエージェンシーに入社。数々の新規事業の立ち上げを担当し、27歳で執行役員に就任。営業担当役員などの要職を歴任",
    "1,000名超の営業組織のマネジメントを経験する中で、僅か4年余りで売上規模を500万円から35億円まで拡大。KPI・KGI分析とデータベースマーケティングで、業界最大級の保険代理店ビジネスへの成長を牽引",
    "はなさく生命保険にて、営業企画部門で新規マーケット開拓を担当",
    "2025年4月にAIビジネスをゼロから開始し、現在AIコンサルタントとして活動",
  ],
  links: {
    x: "https://x.com/Hoshino_Sokichi",
    salon: "https://ai-salon.site/",
  },
};

export const services = {
  eyebrow: "SERVICES",
  heading: "AI実装を一気通貫で支援する4つのサービス",
  leadCopy:
    "すべてワンストップで、貴社に合わせたカスタマイズサポートをご提供します。",
  items: [
    {
      number: "01",
      name: "AI導入研修・組織への定着支援",
      description:
        "基礎動画学習10時間＋カスタマイズワークショップ全5回＋伴走支援で、組織にAIを完全実装させます。",
    },
    {
      number: "02",
      name: "AI導入支援",
      description:
        "貴社の業務に合わせたAIの導入を、実装フェーズから直接サポートします。",
    },
    {
      number: "03",
      name: "実務特化型プログラム研修&支援",
      description:
        "GPTs・Gem・Copilotエージェント・Claude Cowork・Claude Codeなど、実務に直結するプログラムをご提供します。",
    },
    {
      number: "04",
      name: "AI経営戦略支援",
      description:
        "AI戦略の策定から業務プロセスの改善まで、長期伴走型で支援します（AI戦略・業務改革・AIコンサル）。",
    },
  ],
};

export const features = {
  eyebrow: "WHY US",
  heading: "他のAI研修サービスとは、ここが違います",
  items: [
    {
      title: "業務効率化ではなく、売上最大化にコミット",
      description:
        "他社は業務効率化までで終わりがちですが、私は効率化で生まれた時間を新たな売上創出に振り向ける設計までセットでご提供します。組織のリソース再配分を行います。",
    },
    {
      title: "単なる研修で終わらせず、組織に定着させる",
      description:
        "学んで終わりにはしません。AIが現場で当たり前に使われ、組織に定着・実装されるまで、私が最後まで伴走します。",
    },
    {
      title: "完全成果報酬モデル",
      description:
        "完全成果報酬制を採用しているため、貴社は初期費用なしでAI実装を始められます。",
    },
  ],
};

export const curriculum = {
  eyebrow: "TRAINING",
  heading: "AI導入研修の概要",
  leadCopy:
    "基礎動画学習10時間 ＋ カスタマイズワークショップ全5回 ＋ 伴走支援 ＝ 組織にAIを完全実装。",
  intro:
    "AIリテラシー向上と、業務効率化に直結するAIスキル・知識を完全習得していただきます。",
  videosTitle: "① 基礎学習：基礎動画学習（約10時間・全9本）",
  videos: [
    { name: "ChatGPTの汎用活用", description: "汎用文章作成・アイデア出し・対話型業務" },
    { name: "Geminiの汎用活用", description: "Google系連携・最新情報リサーチ" },
    { name: "Claudeの汎用活用", description: "長文処理・複雑な業務文書" },
    { name: "Copilotの汎用活用", description: "Excel・Word・PowerPointの自動化" },
    { name: "GPTsの汎用活用", description: "カスタムGPTsの構築と業務活用" },
    { name: "Gemの汎用活用", description: "GeminiのGemを活用した業務改善" },
    { name: "Claudeスキル", description: "Claudeスキル機能の活用" },
    { name: "Claudeプロジェクト", description: "Claudeプロジェクト機能の活用" },
    { name: "Claude Code", description: "Claude Codeを使った業務自動化" },
  ],
  workshopTitle: "② カスタマイズワークショップ（全5回・計5時間）",
  workshopLead: "基礎から応用まですべてを網羅した、貴社専用のカスタマイズワークショップです。",
  workshopPoints: [
    "貴社の業務に直結する具体的な活用例を実践的に習得",
    "質問・相談に直接対応",
    "受講者全員が手を動かして、実務レベルまで到達することがゴール",
  ],
  mentoringTitle: "③ 伴走支援",
  mentoringDescription:
    "研修後も継続的にAI活用を進めていきたい企業様向けに、長期伴走支援をご提供します。組織にAIを完全実装させます。",
  closing: [
    "基礎動画学習 ＋ カスタマイズワークショップ ＋ 伴走支援 で、",
    "AIスキルと知識を習得＝AIを組織に完全実装。",
  ],
  cta: "サービス詳細資料をダウンロード",
};

export const caseStudy = {
  eyebrow: "CASE STUDY",
  heading: "AI活用で、こんな業務効率化が実現できます",
  leadCopy:
    "AI活用によって、具体的にどのようなことが実現でき、どれほどの時間やコストを削減できるのか。実際の事例をご紹介します。",
  tableHeading: "時間削減のイメージ",
  table: [
    { task: "議事録作成（1件）", before: "120分", after: "15分", cut: "88%減" },
    { task: "提案資料作成（1件）", before: "180分", after: "20分", cut: "89%減" },
    { task: "メール作成（1通）", before: "6分", after: "1分", cut: "83%減" },
    { task: "経理業務（月あたり）", before: "20時間", after: "8時間", cut: "60%減" },
    { task: "総務業務（月あたり）", before: "16時間", after: "8時間", cut: "50%減" },
    { task: "人事業務（月あたり）", before: "20時間", after: "6時間", cut: "70%減" },
  ],
  tableNote:
    "※ 各種業界調査・生成AI導入事例に基づく一般的な目安です。",
};

export const flow = {
  eyebrow: "FLOW",
  heading: "申込みから売上最大化まで7ステップで完結します",
  steps: [
    {
      number: "1",
      title: "フォーム営業から接触",
      description: "メール・LPお問い合わせフォームよりご連絡",
    },
    {
      number: "2",
      title: "無料オンライン相談（30分）",
      description: "オンラインMTGで現状ヒアリング・アドバイス",
    },
    {
      number: "3",
      title: "課題のヒアリングとアドバイス",
      description: "具体的な業務課題を整理・最適なプランをご提案",
    },
    {
      number: "4",
      title: "AI導入研修",
      description: "基礎動画学習＋カスタマイズワークショップ＋伴走支援で組織にAIを完全実装",
    },
    {
      number: "5",
      title: "AI導入支援",
      description: "貴社の業務に合わせたAIの導入を実装フェーズから直接サポート",
    },
    {
      number: "6",
      title: "実務特化型プログラム研修",
      description: "GPTs・Gem・Copilotエージェント・Claude Cowork・Claude Codeなど、実務に直結するプログラムをご提供",
    },
    {
      number: "7",
      title: "AI経営戦略支援",
      description: "AI戦略の策定から業務プロセスの改善まで、伴走型で支援",
    },
  ],
  note: "完全成果報酬のため、初期費用はかかりません。",
};

export const finalCta = {
  eyebrow: "CONTACT",
  heading: "まずは無料オンライン相談から",
  subCopy:
    "貴社の現状をお伺いし、AI活用による売上最大化の具体的なプランをお伝えします。",
  note: "完全成果報酬のため、初期費用はかかりません。",
  disclaimer: "営業電話・しつこい勧誘は一切いたしません。",
  primaryCta: "無料相談を予約する",
  secondaryCta: "サービス詳細資料をダウンロード",
  materialsTitle: "資料ダウンロードの内容",
  materials: [
    "AI実装研修の全体像",
    "4本柱の支援内容詳細",
    "AI導入研修のカリキュラムの詳細",
    "助成金活用の詳細",
    "完全成果報酬モデルの仕組み",
    "業務効率化の具体事例",
    "導入企業の声",
  ],
};

export const footer = {
  copyright: "© 2026 CoreGen",
  services: [
    "AI導入研修・組織への定着支援",
    "AI導入支援",
    "実務特化型プログラム研修&支援",
    "AI経営戦略支援",
  ],
  company: [
    { label: "特定商取引法に基づく表記", slug: "tokushoho" },
    { label: "プライバシーポリシー", slug: "privacy" },
  ],
  companyInfo: {
    name: "CoreGen",
    rep: "星野 創吉",
    address: "東京都北区堀船 1-25-5 サンハイツ 201",
  },
  note: "完全成果報酬のため、初期費用はかかりません。",
  social: {
    x: "https://x.com/Hoshino_Sokichi",
    salon: "https://ai-salon.site/",
  },
};

// 資料ダウンロード（リード獲得）フォーム
// gasUrl: GASウェブアプリをデプロイ後、その /exec URL をここに貼る（空のうちは送信ボタン無効）
export const downloadForm = {
  // GASウェブアプリの公開エンドポイント（公開前提のため直書きでOK。スクリプトIDとは別物）
  gasUrl:
    "https://script.google.com/macros/s/AKfycbxnSB5PhFmlqSTcyCIrEentY69gMGSBJQhhFIx2TEwF1i6CQdIuHEb-bGI2cx_uIiLr/exec",
  eyebrow: "DOWNLOAD",
  heading: "サービス詳細資料ダウンロード",
  lead: "会社名とメールアドレスをご入力ください。ご入力のメールアドレス宛に、サービス詳細資料（PDF）をお送りします。",
  companyLabel: "会社名",
  companyPlaceholder: "株式会社○○",
  emailLabel: "メールアドレス",
  emailPlaceholder: "you@example.com",
  submit: "資料を受け取る",
  sending: "送信中…",
  successTitle: "送信ありがとうございます",
  successBody:
    "ご入力いただいたメールアドレス宛に、サービス詳細資料をお送りしました。数分しても届かない場合は、迷惑メールフォルダもご確認ください。",
  errorBody: "送信に失敗しました。お手数ですが、時間をおいて再度お試しください。",
  preparingNote: "※ ダウンロードフォームは現在準備中です。公開までお待ちください。",
  materialsTitle: "資料の内容",
  materials: [
    "AI実装研修の全体像",
    "4本柱の支援内容詳細",
    "AI導入研修のカリキュラムの詳細",
    "完全成果報酬モデルの仕組み",
    "業務効率化の具体事例",
    "導入企業の声",
  ],
};

// 無料相談予約（TimeRex 埋め込み）
export const reserve = {
  eyebrow: "RESERVE",
  heading: "無料オンライン相談のご予約",
  lead: "ご希望の日時を選んでください。貴社の現状をお伺いし、AI活用による売上最大化の具体的なプランをご提案します。",
  timerexUrl: "https://timerex.net/s/Sokichi_Hoshino/3a56f516",
  note: "※ 営業電話・しつこい勧誘は一切いたしません。オンライン（Zoom・Google Meet・Teams）で実施します。",
};
