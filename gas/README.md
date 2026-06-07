# 資料ダウンロード フォームのバックエンド（GAS ウェブアプリ / clasp管理）

LP の `/download` フォーム（会社名＋メール）から送信されると、入力されたメール宛に
**資料PDFを添付して自動返信**し、運営に通知＋スプレッドシート記録する仕組み。

- 送信処理: Google Apps Script ウェブアプリ（`document-download.gs`）
- 管理: **clasp**（`gas/` を rootDir として push / deploy）
- 送信元: このGASを公開した Google アカウント（**なおき**）の Gmail
- 設定値（メール・各種ID）は**コードに直書きせず、スクリプトプロパティ**から読む
- スクリプトIDは `gas/.clasp.json`（**gitignore済み・コミットしない**）にのみ保持

## ファイル
- `document-download.gs` … 本体（`doPost`/`doGet`/`authorize`/`initProps`）
- `appsscript.json` … マニフェスト（タイムゾーン・ウェブアプリ設定）
- `.clasp.json` … scriptId（ローカルのみ・gitignore）

## clasp 操作
```bash
cd gas
clasp push --force                 # コードをGASへ反映
clasp deploy -i <デプロイID>        # 同じURLのまま更新（URL固定）
clasp open-script                  # ブラウザでエディタを開く
```
※ 新規 `clasp deploy`（-iなし）は**新しいURL**を発行してしまう。URLを変えたくない時は
   必ず既存デプロイIDに `-i` で上書きする。現在のデプロイIDは `clasp list-deployments` で確認。

## 稼働させるための手動ステップ（なおき）

コードのpush・デプロイ・LPへのURL設定は完了済み。残りは以下3つ：

### A. 権限承認（最重要・一度だけ）
ウェブアプリはGmail送信・Drive閲覧の権限が必要。**初回は本人の承認が必須**。
1. `clasp open-script` でエディタを開く。
2. 関数選択で **`authorize`** を選び ▶ 実行。
3. 「権限を確認」→ アカウント選択 →（「安全でない」警告が出たら）詳細→続行→**許可**。
   - これでGmail送信・Drive閲覧が承認され、公開中のフォームが実際に送信できるようになる。

### B. スクリプトプロパティを登録（メール・IDは直書きしない）
エディタ左の「**プロジェクトの設定（⚙）**」→「**スクリプト プロパティ**」で追加：

| プロパティ | 値 | 必須 |
|---|---|---|
| `PDF_FILE_ID` | DriveのPDFファイルID | ✅ |
| `NOTIFY_TO`   | 申込通知の送信先メール（カンマ区切り可） | 任意 |
| `SHEET_ID`    | 記録用スプレッドシートID | 任意 |

> コードで入れたい場合は `initProps()` の値を書き換えて一度だけ実行→その後値を空に戻して保存。
> プロパティは**実行時に読む**ので、後から設定・変更しても再デプロイ不要。

### C. 資料PDFをDriveに置く
1. Google ドライブにPDFをアップロード（本人のDriveにあればOK。共有設定は不要）。
2. 共有リンク `https://drive.google.com/file/d/【ID】/view` の `【ID】` を控える。
3. その値を `PDF_FILE_ID` プロパティに設定（手順B）。
4. PDF差し替え時は、同じファイルを上書きするか、新IDをプロパティに再設定（再デプロイ不要）。

## 動作確認
- ウェブアプリURL（`.../exec`）をブラウザで開く → `CoreGen document-download webapp is running.`
- `/download` フォームにテスト送信 → ①入力メールにPDF添付メール ②通知メール ③シート追記 を確認。

## 注意
- 無料Gmailの送信上限 約100通/日（1申込で2通消費 ≒ 約50件/日）。Workspaceなら約1,500通/日。
- 送信元の表示名は `FROM_NAME`、アドレスは公開アカウント（なおき）のGmail。
  別アドレスにしたい場合はそのGmailの「名前を指定して送信」エイリアスを使用。
