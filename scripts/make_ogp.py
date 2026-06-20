# -*- coding: utf-8 -*-
"""CoreGenロゴからOGP画像(1200x630)を生成する。
白背景＋中央ロゴ＋キャッチ＋オレンジ差し色バー(PKSHA準拠モノクローム)。
出力: public/ogp.png
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
PUB = HERE.parent / "public"

W, H = 1200, 630
INK = (18, 18, 19)        # #121213
MUTE = (110, 112, 117)    # gray
ORANGE = (230, 75, 24)    # #E64B18
BG = (255, 255, 255)

YUGOTH_B = "C:/Windows/Fonts/YuGothB.ttc"

def main():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # --- ロゴ(透過PNG)を白背景に合成 ---
    logo = Image.open(PUB / "logo.png").convert("RGBA")
    target_w = 560
    scale = target_w / logo.width
    logo = logo.resize((target_w, int(logo.height * scale)), Image.LANCZOS)
    lx = (W - logo.width) // 2
    ly = 150
    img.paste(logo, (lx, ly), logo)

    # --- キャッチコピー ---
    catch = "AIで売上を最大化する"
    f_catch = ImageFont.truetype(YUGOTH_B, 56)
    bbox = d.textbbox((0, 0), catch, font=f_catch)
    cw = bbox[2] - bbox[0]
    cy = 350
    d.text(((W - cw) // 2, cy), catch, font=f_catch, fill=INK)

    # --- オレンジ差し色バー(デザインシグネチャー) ---
    bar_w, bar_h = 60, 5
    by = cy + 92
    d.rectangle([(W - bar_w) // 2, by, (W - bar_w) // 2 + bar_w, by + bar_h], fill=ORANGE)

    # --- サブコピー ---
    sub = "AI実装研修  ｜  完全成果報酬モデル"
    f_sub = ImageFont.truetype(YUGOTH_B, 26)
    bbox = d.textbbox((0, 0), sub, font=f_sub)
    sw = bbox[2] - bbox[0]
    d.text(((W - sw) // 2, by + 30), sub, font=f_sub, fill=MUTE)

    out = PUB / "ogp.png"
    img.save(out, "PNG")
    print(f"[OK] OGP: {out} ({W}x{H})")

if __name__ == "__main__":
    main()
