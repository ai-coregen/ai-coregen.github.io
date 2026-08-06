// public/ 配下のファイルがビルド時に実在するかを見るだけのヘルパー。
// 用途: セクション画像が「まだ生成されていない」間はレイアウトから外し、
//       ファイルが置かれた次のビルドで自動的に表示されるようにする。
// **ビルド時（サーバー側）専用**。クライアントスクリプトから読み込まないこと。
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// ビルド時にモジュールはバンドルされるので import.meta.url はソースの場所を指さない。
// プロジェクト直下（astro.config.mjs のある場所）から public/ を探す。
function findPublicDir(): string {
  let dir = process.cwd();
  for (let i = 0; i < 4; i++) {
    if (existsSync(join(dir, "astro.config.mjs")) && existsSync(join(dir, "public"))) {
      return join(dir, "public");
    }
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return join(process.cwd(), "public");
}

const PUBLIC_DIR = findPublicDir();

/** 例: hasPublicAsset("industry/manufacturing-hero.webp") */
export function hasPublicAsset(relPath: string): boolean {
  return existsSync(join(PUBLIC_DIR, relPath));
}

/**
 * WebPの実寸を読む。`<img>` に width/height を出してレイアウトのズレ（CLS）を防ぐため。
 * 画像の縦横比を決め打ちしないので、業種ごとに比率が違っても切り取られない。
 * 読めない形式なら null を返す（呼び出し側は属性なしで描画する）。
 */
export function webpSize(relPath: string): { width: number; height: number } | null {
  const file = join(PUBLIC_DIR, relPath);
  if (!existsSync(file)) return null;
  const buf = readFileSync(file);
  if (buf.length < 32) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  const fourcc = buf.toString("ascii", 12, 16);
  if (fourcc === "VP8X") {
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  }
  if (fourcc === "VP8 ") {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (fourcc === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}
