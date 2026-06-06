# 参照デザインシステム: PKSHA AI SaaS

出典: https://aisaas.pkshatech.com/ （HubSpot CMS製。CSS実値を直接抽出）
用途: AI研修LPのデザイン刷新の基準。

## 1. ブランド人格

ミニマル・プレミアム・モノクロームの日本型エンタープライズSaaS。
余白が広く、字間が広く、洗練・信頼感。黒/白/グレーを基調に、差し色を**極めて控えめ**に使う（塗りではなく罫線・CTAのみ）。
現行LP（DigiRise系の青紫グラデ・角丸12px・紫の影・派手）とは**真逆の方向性**。

## 2. カラーパレット（実抽出値）

| 役割 | HEX | 用途 |
|---|---|---|
| インク（基準黒） | `#121213` | 本文・ボタン文字・濃色背景 |
| 純黒 | `#000` | タイトル下線の起点 |
| 白 | `#fff` | 背景・ボタン地 |
| 罫線グレー | `#d9d9d9` | ボーダー全般 |
| ミュートグレー | `#677070` | サブタイトル・注釈・補足文字 |
| 薄グレー背景 | `#f5f5f5` | パンくず等の帯背景 |
| 下線テールグレー | `#ddd` | タイトル下線の後半 |
| アイコン円グレー | `#ebebeb` | ボタン内の円アイコン地 |
| 差し色オレンジ | `#e64b18` | CTA強調 |
| 差し色ティール | `#00b3a1` | CTA強調 |
| 差し色ブルーパープル | `#524dfe` | 浮きカードの上罫線 |
| 差し色ブルー | `#0079c9` | 浮きカードの下罫線 |

差し色4色（オレンジ/ティール/ブルーパープル/ブルー）はPKSHAのブランドグラデを想起させるが、**面では使わず罫線かCTA地のみ**。基調はあくまでモノクロ。

## 3. タイポグラフィ

- 和文: `Yu Gothic, Hiragino Kaku Gothic ProN, Hiragino Sans`
- 欧文（見出しラベル・ボタン・HeroのH1）: **`Satoshi`**（ジオメトリック系）
- 基準: 16px / weight 400 / **letter-spacing 2px**（SP 15px / 1px）
- 見出し: **letter-spacing 4px**（SP 2px）/ line-height 1.5
- 広い字間が最大の個性（プレミアムで空気感がある）

### スケール
| 要素 | PC | 1080 | SP | weight | font |
|---|---|---|---|---|---|
| Hero メインコピー `.main-copy` | 64px | 48px | 32px | 700 | 和文 |
| Hero H1（英ラベル） | 26px | 20px | 16px | 700 | Satoshi |
| Hero サブコピー | 18px | 16px | 14px | 700 | 和文 |
| セクションタイトル `.title` | 32px | 28px | 24px | 700 | 和文 |
| アイブロウ `.sub-title` | 18px | - | 14px | 700 | Satoshi（色`#677070`, mb24px） |
| 注釈 `.annotation` | 12px | - | 11px | 500 | `#677070` |

line-heightは全体的に詰め気味の1.5。

## 4. レイアウト・余白

- セクション縦padding `.outline`: **120px**（≤1080: 80px）
- インナー `.innerline`: max-width **1260px** / padding `0 30px`（1080: 0 64px → 0 32px / SP: 0 24px）
- コンテンツ `.inner-content`: max-width **1200px**
- リズムは大きめ（appeal-box mt107px、CTA mt48px など）

## 5. シグネチャー要素（これがPKSHAらしさ）

1. **タイトル下線グラデ** ★最重要モチーフ
   `background: linear-gradient(90deg, #000 50px, #ddd 0); height:4px; margin-top:24px; width:100%`
   → 各セクションタイトル下に、最初の50pxだけ黒・残りは薄グレーの4pxバー。
2. **英語アイブロウ**: タイトル上にSatoshiの英語ラベルをグレーで置く。
3. **ピルボタン** `.btn`:
   `border-radius:40px; background:#fff; color:#121213; font:Satoshi 16px/700; padding:23px 63px`
   右端に円形SVGアイコン（円`#ebebeb`＋三角`#121213`、32px）。
   invertedはhoverで円が黒・三角が白に反転。hover opacity .7。
   Hero内のボタンは `width:380px`、`gap:30px`で横並び。
4. **縦書きサイドCTA** `.side-menu`: 画面右端fixed、`writing-mode:vertical-rl`、色分け（orange/teal/black/white/gray）。SPでは下部固定バーに変化。
5. **色付き上下罫線の浮きカード**（section02）:
   `border-top:4px solid #524dfe; border-bottom:4px solid #0079c9; filter:drop-shadow(5px 0 10px rgba(0,0,0,.2)); margin-top:-150px`（前セクションに重ねて浮かせる）。
6. **Hero背景動画**: `position:absolute; opacity:.5; z-index:-1; width:130%; right:-34%` でコピーの背後にうっすら。
7. **ホバー**: リンク opacity .4 / ボタン opacity .7。
8. **ほぼ影なし・フラット**。角丸もほぼ無し（カードは角丸なし、ボタンのみ40px、ヘッダー小要素4px、円50%）。
9. CSSリセットは `destyle.css`。

### アニメーション
`slideUpFadeIn`: translateY(80px)→0 + opacity、.6s ease。スクロール出現に使用。

## 6. 現行LPとのギャップ（刷新で変える点）

| 項目 | 現行LP | PKSHA基準 |
|---|---|---|
| 基調 | 青紫グラデ多用・派手 | モノクロ＋差し色は罫線/CTAのみ |
| カード | 角丸12px・紫の影 | 角丸なし・フラット・影最小 |
| ボタン | グラデ塗り | 白地ピル40px＋円アイコン・モノクロ |
| 見出し | グラデ文字 | 黒文字＋黒→グレー下線バー |
| 字間 | 0.04em | 2px（見出し4px）と広い |
| セクション余白 | 標準 | 120pxと広い |
| 欧文ラベル | なし | Satoshiの英語アイブロウ |
| フォント | Noto Sans JP | Yu Gothic＋Satoshi |
