/**
 * CoreGen 資料ダウンロード フォーム受信スクリプト（Google Apps Script ウェブアプリ）
 *
 * 役割:
 *   LPの /download フォームから {companyName, email} のPOSTを受け取り、
 *   1) 申込者へ「資料PDF添付メール」を自動返信
 *   2) 運営（NOTIFY_TO）へ申込通知メール
 *   3) スプレッドシートに1行記録（SHEET_ID 指定時のみ）
 *
 * 設定値（メール/各種ID）はコードに直書きせず、スクリプトプロパティから読み込む。
 * 送信元 = このスクリプトを公開した Google アカウントの Gmail。
 * セットアップは同フォルダの README.md を参照。
 */

// ===== 直書きしない設定（スクリプトプロパティのキー名）=========
// プロジェクトの設定 → スクリプト プロパティ で以下を登録:
//   PDF_FILE_ID … DriveのPDFファイルID（必須）
//   NOTIFY_TO   … 申込通知の送信先メール（カンマ区切り可。空なら通知しない）
//   SHEET_ID    … 記録用スプレッドシートID（空なら記録しない）
// 一度だけ initProps() を実行してUIから登録する方法も可（下部参照）。
// ===============================================================

// 表示文言（機密でないのでコード内に保持。必要ならプロパティで上書き可）
var TEXT = {
  FROM_NAME: 'CoreGen',
  SUBJECT: '【CoreGen】サービス詳細資料をお送りします',
  ATTACHMENT_NAME: 'CoreGen_サービス詳細資料.pdf',
  RESERVE_URL: 'https://ai-coregen.github.io/reserve'  // 無料相談予約ページ
};

function prop_(key, def) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  return (v === null || v === undefined || v === '') ? (def || '') : v;
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var companyName = String(body.companyName || '').trim();
    var email = String(body.email || '').trim();

    // honeypot（フォーム側で弾くが念のため）
    if (body._gotcha) return json_({ ok: true });

    if (!companyName) return json_({ ok: false, error: 'companyName required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: 'invalid email' });
    }

    var PDF_FILE_ID = prop_('PDF_FILE_ID');
    var NOTIFY_TO = prop_('NOTIFY_TO');
    var SHEET_ID = prop_('SHEET_ID');

    // 1) 申込者へ資料メール（PDF添付）
    var options = {
      name: prop_('FROM_NAME', TEXT.FROM_NAME),
      htmlBody: applicantHtml_(companyName)
    };
    if (PDF_FILE_ID) {
      var blob = DriveApp.getFileById(PDF_FILE_ID).getBlob();
      var attachName = prop_('ATTACHMENT_NAME', TEXT.ATTACHMENT_NAME);
      if (attachName) blob.setName(attachName);
      options.attachments = [blob];
    }
    GmailApp.sendEmail(email, prop_('SUBJECT', TEXT.SUBJECT), applicantText_(companyName), options);

    // 2) 運営へ通知
    if (NOTIFY_TO) {
      MailApp.sendEmail(
        NOTIFY_TO,
        '【資料請求】' + companyName,
        '会社名: ' + companyName + '\nメール: ' + email + '\n日時: ' + new Date()
      );
    }

    // 3) スプレッドシート記録
    if (SHEET_ID) {
      var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
      sheet.appendRow([new Date(), companyName, email]);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// デプロイ確認用（ブラウザでURLを開くと表示される）
function doGet() {
  return ContentService
    .createTextOutput('CoreGen document-download webapp is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * 設定をコードから登録したい場合の補助。
 * 値を書き換えて、この関数を一度だけ実行（▶）すればスクリプトプロパティに保存される。
 * 実行後はこの中の値を空に戻してコミットしないこと（メール等を直書きで残さない）。
 */
function initProps() {
  PropertiesService.getScriptProperties().setProperties({
    PDF_FILE_ID: '',   // ← DriveのPDFファイルID
    NOTIFY_TO: '',     // ← 通知先メール
    SHEET_ID: ''       // ← 記録用スプレッドシートID（任意）
  }, true);
}

/**
 * 権限承認用。エディタでこの関数を一度だけ実行（▶）すると、
 * Gmail送信・Drive閲覧の同意ダイアログが出るので承認する。
 * 承認後、公開中のウェブアプリ（doPost）がメール送信できるようになる。
 */
function authorize() {
  GmailApp.getAliases();      // Gmail送信スコープを要求
  DriveApp.getRootFolder();   // Drive閲覧スコープを要求
  return 'authorized';
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function applicantText_(companyName) {
  var reserveUrl = prop_('RESERVE_URL', TEXT.RESERVE_URL);
  return [
    companyName + ' ご担当者様',
    '',
    'この度は CoreGenのサービス詳細資料をご請求いただき、誠にありがとうございます。',
    '本メールに資料（PDF）を添付しております。ご査収ください。',
    '',
    '貴社の現状をお伺いし、AI活用による売上最大化の具体的なプランをお伝えする',
    '無料オンライン相談（30分）を実施しております。ご希望の方は下記よりご予約ください。',
    '▼ 無料相談のご予約はこちら',
    reserveUrl,
    '',
    'ご不明点や無料相談のご希望がございましたら、本メールにそのままご返信いただいても結構です。',
    '',
    '────────────────',
    'CoreGen',
    '代表 星野 創吉',
    'X: https://x.com/Hoshino_Sokichi',
    '────────────────'
  ].join('\n');
}

function applicantHtml_(companyName) {
  var reserveUrl = prop_('RESERVE_URL', TEXT.RESERVE_URL);
  return ''
    + '<div style="font-family:\'Yu Gothic\',sans-serif;color:#121213;line-height:1.8;">'
    + '<p>' + escapeHtml_(companyName) + ' ご担当者様</p>'
    + '<p>この度は <b>CoreGen</b> のサービス詳細資料をご請求いただき、誠にありがとうございます。<br>'
    + '本メールに資料（PDF）を添付しております。ご査収ください。</p>'
    + '<p>貴社の現状をお伺いし、AI活用による売上最大化の具体的なプランをお伝えする'
    + '<b>無料オンライン相談（30分）</b>を実施しております。ご希望の方は下記よりご予約ください。</p>'
    + '<p><a href="' + reserveUrl + '" '
    + 'style="display:inline-block;background:#121213;color:#fff;text-decoration:none;'
    + 'padding:12px 28px;border-radius:40px;font-weight:700;">無料相談を予約する</a></p>'
    + '<p style="font-size:13px;color:#677070;">ご不明点や無料相談のご希望がございましたら、本メールにそのままご返信いただいても結構です。</p>'
    + '<hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">'
    + '<p style="font-size:13px;color:#677070;">CoreGen<br>代表 星野 創吉<br>'
    + 'X: <a href="https://x.com/Hoshino_Sokichi">@Hoshino_Sokichi</a></p>'
    + '</div>';
}

function escapeHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
