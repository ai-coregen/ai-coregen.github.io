# -*- coding: utf-8 -*-
"""
業種LPのコピー突合（公開前の検品用）。

knowledge/industry-copy/{slug}.md のコードブロックに書かれた日本語の行が、
ビルド後の dist/{slug}/index.html に一字一句出ているかを機械で確認する。

budoux が本文に <wbr> を差し込むため、目視やそのままの grep では必ず見落とす。
このスクリプトはタグと <wbr> を除去し、空白を無視して突合する。

使い方:
    npm run build
    python scripts/verify_industry_copy.py manufacturing

終了コード: 0=一致 / 1=未描画あり / 2=ファイルが無い
"""
import argparse
import html
import re
import sys
from pathlib import Path

LP = Path(__file__).resolve().parent.parent

# ページに出さないのが正しい行（業種ごと）。
# ここに載せる時は「なぜ出さないか」を必ず添える。
EXPECTED_UNRENDERED = {
    "manufacturing": [
        # OGP画像に焼くテキスト。ページ本文には描画しない
        "製造業向け AI業務自動化構築代行",
    ],
    "construction": [
        # OGP画像に焼くテキスト。ページ本文には描画しない
        "建設・設備工事向け AI業務自動化構築代行",
    ],
    "hr": [
        # OGP画像に焼くテキスト。ページ本文には描画しない
        "人材紹介・派遣向け AI業務自動化構築代行",
    ],
    "logistics": [
        # OGP画像に焼くテキスト。ページ本文には描画しない
        "運送・物流向け AI業務自動化構築代行",
    ],
    "auto": [
        # OGP画像に焼くテキスト。ページ本文には描画しない
        "自動車整備向け AI業務自動化構築代行",
    ],
    "print": [
        # OGP画像に焼くテキスト。ページ本文には描画しない
        "印刷業向け AI業務自動化構築代行",
    ],
    "medical-care": [
        # OGP画像に焼くテキスト。ページ本文には描画しない
        "医療・介護向け AI業務自動化構築代行",
    ],
    "realestate": [
        # OGP画像に焼くテキスト。ページ本文には描画しない
        "不動産向け AI業務自動化構築代行",
    ],
}

# コードブロックを丸ごと対象外にするセクション（見出しに含まれる語で判定）。
# プロフィールはトップLPの ProfileSection を再利用する指示なので、
# 文言の正本は content.ts 側にある。
SKIP_SECTIONS = ("プロフィール",)

# 表のセルのうち、ページに出す文言ではなく仕様の書き方であるもの。
# 正本は処理表（工程／内容）と工程フロー図を**表**で書いているので、
# 表のセルも突合対象にする。そのとき混じる「指示」だけを落とす。
TABLE_SKIP = {
    "順", "状態", "導入前のラベル", "導入後のラベル", "通常", "消滅",
    # 工程フロー図の「導入後の見せ方」列は描き方の指示で、ページに出す文言ではない
    "導入後の見せ方", "グレー枠（人は触らない）", "記号で対比",
    # 現行業務フロー図の「枠」列＝オレンジ枠か黒枠かの指定。ページに出す文言ではない
    "黒", "オレンジ",
}

# 見出し行にこれらの語を含む表は**仕様の表**とみなす。
# 仕様の表からは、**バッククォートで囲まれた部分だけ**を突合対象にする
# （正本は仕様の表の中でも「ページに出す文言」だけを `…` で囲んで書いている。
#   例: 現行業務フロー図の `| 位置 | 要素 | 中身 |` の表は、説明文の中に副題と添え書きの
#   実文言が `…` で入っている。表ごと飛ばすとこの2行が検品から漏れる）。
SPEC_TABLE_HEADERS = ("セクション", "視覚要素", "画像", "強調する語", "確認事項",
                      "位置", "要素")

JA = r"[぀-ゟ゠-ヿ一-鿿]"

# --- PCで1行に収める行の長さ ---------------------------------------------------
#
# **1行必須なのは3つだけ**: ①悩みチェックリスト ②STEPの説明行 ③セクション5のリード。
# 納品物カードの説明は**2行まで許容**（2026-08-06 なおき決定）。無理に詰めない。
# 不自然な位置での折り返しは budoux の文節改行が防ぐので、行数だけを見る。
#
# 上限は実測から出している。本文15px・字間0.12emで全角1文字あたり約16.9px。
# 半角は約0.6文字ぶんの幅なので、そのように数える（`Excel` `STEP 02` `AI` を全角と同じに
# 数えると、実際には収まる文をNGにしてしまう）。
#   チェックリスト: 列の内寸 約516px → 30
#   STEPの説明行  : 丸番号を除いた幅 約526px → 31
#   セクション5リード: 幅940px → 55（正本は読みやすさから35字前後を推奨。ここは溢れの検出だけ）
CHECKLIST_MAX_WIDTH = 30
STEP_BODY_MAX_WIDTH = 31
LEAD_MAX_WIDTH = 55


def norm(s):
    """空白（全角含む）と罫線飾りを落として比較用に正規化する

    罫線（`──` など）は**正本とページの両方から同じように落とす**。
    片側だけで落とすと、副題のように罫線を含む行が永久に一致しなくなる。
    """
    return re.sub(r"[\s─━—―]+", "", s)


def page_text(page_html):
    """描画されるテキスト＋meta/ogのcontentを平坦化する"""
    t = re.sub(r"<script.*?</script>", " ", page_html, flags=re.S)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S)
    t = t.replace("<wbr>", "").replace("<wbr/>", "")
    t = re.sub(r"<[^>]+>", "", t)
    attrs = " ".join(re.findall(r'content="([^"]*)"', page_html))
    return norm(html.unescape(t + attrs))


def copy_lines(md_text):
    """コードブロック内の日本語行を、装飾記号を落として取り出す"""
    # 「実装への注記」以降は実装指示とアーカイブ（不採用案）なので対象外
    body = md_text.split("## 実装への注記")[0]
    lines = []
    in_block = False
    in_table = False
    table_is_spec = False
    section = ""
    for i, raw in enumerate(body.splitlines(), 1):
        if not raw.strip().startswith("|"):
            in_table = False
            table_is_spec = False
        if raw.startswith("## "):
            section = raw
        if raw.strip().startswith("```"):
            in_block = not in_block
            continue
        if any(word in section for word in SKIP_SECTIONS):
            continue
        # 表のセル（コードブロックの外）も突合する
        if not in_block and raw.strip().startswith("|"):
            if not in_table:
                # 表の1行目＝見出し行。**列名はページに出す文言ではないので突合しない**
                # （旧実装は見出し行のセルも拾っており、`位置` `要素` `中身` `担当ラベル` が
                #   そのまま未描画として並んでいた）。
                in_table = True
                table_is_spec = any(w in raw for w in SPEC_TABLE_HEADERS)
                continue
            for cell in raw.strip().strip("|").split("|"):
                c = cell.replace("**", "").strip()
                if not c or not re.search(JA, c):
                    continue
                if table_is_spec:
                    # 仕様の表は `…` で囲まれた実文言だけを見る
                    for quoted in re.findall(r"`([^`]+)`", c):
                        if re.search(JA, quoted):
                            lines.append((i, quoted.replace("─", "")))
                    continue
                if c in TABLE_SKIP or c.startswith("（"):
                    continue
                if "✕" in c or "◯" in c or "差し色" in c:
                    continue
                # 表のセルは「A／B／C」で項目を並べるので、項目ごとに分けて突合する
                # （役割設計図の「各枠の中身」が この書き方）
                if "／" in c:
                    for part in c.split("／"):
                        part = part.strip()
                        if part and re.search(JA, part):
                            lines.append((i, part))
                    continue
                lines.append((i, c))
            continue
        if not in_block:
            continue
        s = raw.strip()
        if not s or not re.search(JA, s):
            continue
        s = re.sub(r"^[□・]\s*", "", s)   # □ ・
        s = re.sub(r"^\d+\.\s*", "", s)            # 納品物の番号
        s = re.sub(r"^STEP\s+\d+\s*", "", s)       # STEP 01
        s = re.sub(r"^[QA]\.\s*", "", s)           # Q. A.
        s = s.replace("　", "")
        s = s.replace("─", "")                     # 図の中の罫線飾り
        # 工程フローの1行は「A → B → C」で書かれているので、工程ごとに分けて突合する
        if "→" in s:
            for part in s.split("→"):
                part = part.strip()
                if part and re.search(JA, part):
                    lines.append((i, part))
            continue
        if s:
            lines.append((i, s))
    return lines


def strip_tags(fragment):
    """<wbr> とタグを落として平文にする"""
    return norm(html.unescape(re.sub(r"<[^>]+>", "", fragment.replace("<wbr>", ""))))


def width_of(text):
    """表示幅を全角文字数に換算する（半角は約0.6文字ぶん）"""
    return sum(0.6 if ord(c) < 0x300 else 1.0 for c in text)


def checklist_items(page_html):
    """悩みチェックリストの各項目"""
    m = re.search(r'<ul class="ind-checklist.*?</ul>', page_html, flags=re.S)
    if not m:
        return []
    return [t for t in (strip_tags(li)
            for li in re.findall(r"<li[^>]*>(.*?)</li>", m.group(0), flags=re.S)) if t]


def step_bodies(page_html):
    """進め方のSTEPの説明行（丸番号・STEPラベル・見出しは含めない）"""
    m = re.search(r'<section[^>]*id="process".*?</section>', page_html, flags=re.S)
    if not m:
        return []
    bodies = []
    for li in re.findall(r"<li[^>]*>(.*?)</li>", m.group(0), flags=re.S):
        # 1つ目の <p> は "STEP 01" のラベル、最後の <p> が説明行（見出しは h3）。
        # 本文が "STEP 02の数字と比べ…" のようにラベルと同じ書き出しになることがあるので、
        # 文字列で見分けずに位置で取る。
        paras = re.findall(r"<p[^>]*>(.*?)</p>", li, flags=re.S)
        if len(paras) >= 2:
            text = strip_tags(paras[-1])
            if text:
                bodies.append(text)
    return bodies


def lead_lines(page_html):
    """セクション5のリード"""
    m = re.search(r'<div class="ind-lead.*?</div>', page_html, flags=re.S)
    if not m:
        return []
    return [t for t in (strip_tags(p)
            for p in re.findall(r"<p[^>]*>(.*?)</p>", m.group(0), flags=re.S)) if t]


def check_one_line(page_html):
    """PCで1行に収める3種類の行が、上限幅に収まっているかを見る"""
    targets = [
        ("チェックリスト", checklist_items(page_html), CHECKLIST_MAX_WIDTH),
        ("STEPの説明行", step_bodies(page_html), STEP_BODY_MAX_WIDTH),
        ("セクション5リード", lead_lines(page_html), LEAD_MAX_WIDTH),
    ]
    over = []
    for name, items, limit in targets:
        print("[INFO] %-16s: %d行（上限%d字相当）" % (name, len(items), limit))
        if not items:
            print("  [NG] %s が1行も取れていない（描画かセレクタの変更を疑う）" % name)
            over.append((name, "(取得0件)", 0, limit))
            continue
        for t in items:
            w = width_of(t)
            if w > limit:
                over.append((name, t, w, limit))
    return over


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug", help="業種スラッグ（例: manufacturing）")
    args = ap.parse_args()
    slug = args.slug

    md_path = LP / "knowledge" / "industry-copy" / ("%s.md" % slug)
    page_path = LP / "dist" / slug / "index.html"
    for p in (md_path, page_path):
        if not p.exists():
            print("[NG] ファイルが無い: %s" % p)
            if p is page_path:
                print("     先に npm run build を実行してください")
            return 2

    flat = page_text(page_path.read_text(encoding="utf-8"))
    allowed = [norm(s) for s in EXPECTED_UNRENDERED.get(slug, [])]

    missing, skipped = [], 0
    for ln, s in copy_lines(md_path.read_text(encoding="utf-8")):
        n = norm(s)
        if n in flat:
            continue
        if any(n in a or a in n for a in allowed):
            skipped += 1
            continue
        missing.append((ln, s))

    print("[INFO] 対象: %s" % slug)
    print("[INFO] 突合した行数     : %d" % len(copy_lines(md_path.read_text(encoding='utf-8'))))
    print("[INFO] 出さないのが正の行: %d" % skipped)
    print("[INFO] 未描画           : %d" % len(missing))
    for ln, s in missing:
        print("  [NG] %s.md:%d  %s" % (slug, ln, s))

    # 強調（1セクション1〜2語。0個や極端に多い時は当て間違いを疑う）
    ems = re.findall(r'<strong class="ind-em"[^>]*>(.*?)</strong>',
                     page_path.read_text(encoding="utf-8"), flags=re.S)
    ems = [re.sub(r"<[^>]+>", "", e).replace("​", "") for e in ems]
    print("[INFO] 強調の数         : %d" % len(ems))
    for e in ems:
        print("       - %s" % e)

    # CTAの計測パラメータ
    page_raw = page_path.read_text(encoding="utf-8")
    # 末尾スラッシュは任意（2026-08-27 に ctaUrl が /reserve/ 形式へ変わった。
    # 旧形式のビルド成果物を検品しても落ちないよう、どちらも通す）
    ctas = sorted(set(re.findall(
        r'/(reserve|download)/?\?cta=([a-z]+)&(?:amp;)?v=([a-z0-9_]+)', page_raw)))
    print("[INFO] CTAリンク        : %d" % len(ctas))
    for page, pos, ver in ctas:
        print("       - /%s/?cta=%s&v=%s" % (page, pos, ver))
    if not ctas:
        print("  [NG] CTAに計測パラメータが付いていない")

    # PCで1行に収める行の長さ（納品物カードは2行まで許容なので対象外）
    too_long = check_one_line(page_raw)
    for name, text, w, limit in too_long:
        print("  [NG] %s が1行に収まらない（%.1f字相当 > %d）: %s" % (name, w, limit, text))

    ok = not missing and not too_long and bool(ctas)
    print("[%s] %s" % ("OK" if ok else "NG", "コピーは正本と一致しています" if ok else "差分あり。上の[NG]を確認してください"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
