/**
 * CoreGen 資料ダウンロード フォーム受信スクリプト（Google Apps Script ウェブアプリ）
 *
 * 役割:
 *   LPの /download フォームから {companyName, email} のPOSTを受け取り、
 *   1) 申込者へ「資料PDF添付メール」を自動返信
 *   2) 運営へ申込通知（DISCORD_WEBHOOK_URL があれば Discord・無ければ NOTIFY_TO へメール。
 *      Discord優先の理由 = GASのメールquota(無料100通/日)を申込者への資料送付に全振りするため）
 *   3) スプレッドシートに1行記録（SHEET_ID 指定時のみ）
 *
 * 設定値（メール/各種ID）はコードに直書きせず、スクリプトプロパティから読み込む。
 * 送信元 = このスクリプトを公開した Google アカウントの Gmail。
 * セットアップは同フォルダの README.md を参照。
 */

// ===== 直書きしない設定（スクリプトプロパティのキー名）=========
// プロジェクトの設定 → スクリプト プロパティ で以下を登録:
//   PDF_FILE_ID         … DriveのPDFファイルID（必須）
//   DISCORD_WEBHOOK_URL … 申込通知先のDiscord webhook（設定時はメール通知の代わりにDiscordへ。quota節約）
//   NOTIFY_TO           … 申込通知の送信先メール（webhook未設定/失敗時のフォールバック。空なら通知しない）
//   SHEET_ID            … 記録用スプレッドシートID（空なら記録しない）
//   SEND_AS             … 申込者への資料メールの送信元アドレス（例: sokichi0614@gmail.com）。
//                         このアドレスを公開アカウント(このスクリプトのオーナー)のGmailで
//                         「送信元アドレスの追加(Send mail as)」に登録・確認済みの場合のみ From に反映。
//                         未登録/未確認なら From は従来のオーナーアドレスにフォールバックし、
//                         いずれの場合も Reply-To は SEND_AS に向く（返信は必ずここへ届く）。
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

// ===== 計測（measurement-plan.md §5/§12）: token受領・clicks/downloadsタブ =====
function stamp_() {
  var tz = Session.getScriptTimeZone() || 'Asia/Tokyo';
  return Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd HH:mm:ss');
}

// tokenは英数記号の短い形のみ通す（汚染ログ/インジェクション防止）
function safeToken_(t) {
  t = String(t || '').trim();
  return /^[A-Za-z0-9_-]{1,32}$/.test(t) ? t : '';
}

// シート名で取得（無ければヘッダ付きで作成）。getSheets()[0] の位置依存を廃止
function sheetByName_(name, header) {
  var ss = SpreadsheetApp.openById(prop_('SHEET_ID'));
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (header) sh.appendRow(header);
  }
  return sh;
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var companyName = String(body.companyName || '').trim();
    var email = String(body.email || '').trim();
    var token = safeToken_(body.token);
    var event = String(body.event || '').trim();

    // honeypot（フォーム側で弾くが念のため）
    if (body._gotcha) return json_({ ok: true });

    // タブ事前生成（管理用・一度きり）: 「資料DL」「クリック」タブをヘッダ付きで用意（無ければ作成）
    if (event === 'setup') {
      if (prop_('SHEET_ID')) {
        sheetByName_('資料DL', ['日時', '会社名', 'メール', 'トークン']);
        sheetByName_('クリック', ['日時', 'トークン', 'ページ']);
      }
      return json_({ ok: true, setup: true });
    }

    // 通知経路の疎通テスト（管理用）: Discordへテスト投稿し成否を返す（メール送信・シート記録なし）
    if (event === 'notify_test') {
      return json_({ ok: true, discord: notifyDiscord_('[TEST] 資料請求通知の経路テスト（doPost notify_test）') });
    }

    // 訪問/クリックビーコン: 「クリック」タブに1行だけ（メール送信などはしない・PIIはtokenのみ）
    if (event === 'visit') {
      if (prop_('SHEET_ID') && token) {
        var page = String(body.page || '').slice(0, 64);
        sheetByName_('クリック', ['日時', 'トークン', 'ページ']).appendRow([stamp_(), token, page]);
      }
      return json_({ ok: true });
    }

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
    // 送信元を星野さんのアドレスに。確認済みエイリアスの時だけ From に反映（未確認でも送信は壊さない）。
    var sendAs = prop_('SEND_AS');
    if (sendAs) {
      options.replyTo = sendAs;  // 返信は常に SEND_AS へ
      try {
        if (GmailApp.getAliases().indexOf(sendAs) !== -1) options.from = sendAs;
      } catch (e) {}
    }
    if (PDF_FILE_ID) {
      var blob = DriveApp.getFileById(PDF_FILE_ID).getBlob();
      var attachName = prop_('ATTACHMENT_NAME', TEXT.ATTACHMENT_NAME);
      if (attachName) blob.setName(attachName);
      options.attachments = [blob];
    }
    GmailApp.sendEmail(email, prop_('SUBJECT', TEXT.SUBJECT), applicantText_(companyName), options);

    // 2) 運営へ通知（Discord優先。webhook未設定/失敗時のみメール = quota消費を1通/申込に抑える）
    var notified = notifyDiscord_(
      '【資料請求】' + companyName + '\nメール: ' + email + (token ? '\nトークン: ' + token : '')
    );
    if (!notified && NOTIFY_TO) {
      MailApp.sendEmail(
        NOTIFY_TO,
        '【資料請求】' + companyName,
        '会社名: ' + companyName + '\nメール: ' + email + '\n日時: ' + new Date()
      );
    }

    // 3) スプレッドシート記録（「資料DL」タブ・token付き）
    if (SHEET_ID) {
      var sheet = sheetByName_('資料DL', ['日時', '会社名', 'メール', 'トークン']);
      sheet.appendRow([stamp_(), companyName, email, token]);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * Discord webhookへ通知。成功=true / webhook未設定・失敗=false（呼び元がメールにフォールバック）。
 * 失敗しても doPost 全体は落とさない（申込者への資料送付が最優先）。
 */
function notifyDiscord_(content) {
  var url = prop_('DISCORD_WEBHOOK_URL');
  if (!url && typeof discordWebhookUrl_ === 'function') url = discordWebhookUrl_();  // secrets.gs フォールバック
  if (!url) return false;
  try {
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ content: content }),
      muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    return code >= 200 && code < 300;
  } catch (err) {
    return false;
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
    PDF_FILE_ID: '',         // ← DriveのPDFファイルID
    DISCORD_WEBHOOK_URL: '', // ← 申込通知先のDiscord webhook（secrets.gs の setupDiscordWebhook() でも登録可）
    NOTIFY_TO: '',           // ← 通知先メール（webhookのフォールバック）
    SHEET_ID: '',            // ← 記録用スプレッドシートID（任意）
    SEND_AS: '',             // ← 資料メールの送信元アドレス（例: sokichi0614@gmail.com。要 Send mail as 登録・確認）
    RESERVE_URL: ''          // ← 無料相談予約URL（空ならTEXT.RESERVE_URLにフォールバック）
  }, true);
}

/**
 * 送信元アドレス(SEND_AS)だけを登録する専用ヘルパー。
 * エディタでこの関数を一度だけ実行（▶）すれば、資料メールの送信元が
 * sokichi0614@gmail.com になる（他のプロパティは変更しない）。
 * 実行後、ログに現在のGmailエイリアス一覧が出るので sokichi0614 が含まれていれば From に反映される。
 */
function setSendAs() {
  PropertiesService.getScriptProperties().setProperty('SEND_AS', 'sokichi0614@gmail.com');
  var aliases = GmailApp.getAliases();
  Logger.log('SEND_AS を sokichi0614@gmail.com に設定しました。');
  Logger.log('現在の送信可能アドレス（エイリアス）: ' + JSON.stringify(aliases));
  Logger.log(aliases.indexOf('sokichi0614@gmail.com') !== -1
    ? 'OK: sokichi0614@gmail.com が含まれています。送信元に反映されます。'
    : '注意: まだ含まれていません（承認が反映されるまで数分かかることがあります）。');
  return 'done';
}

/**
 * 権限承認用。エディタでこの関数を一度だけ実行（▶）すると、
 * Gmail送信・Drive閲覧の同意ダイアログが出るので承認する。
 * 承認後、公開中のウェブアプリ（doPost）がメール送信できるようになる。
 */
function authorize() {
  GmailApp.getAliases();      // Gmail送信スコープを要求
  DriveApp.getRootFolder();   // Drive閲覧スコープを要求
  UrlFetchApp.fetch('https://discord.com', { muteHttpExceptions: true });  // 外部リクエストスコープ（Discord通知用）
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
    '御社の現状をお伺いし、AI活用による売上最大化の具体的なプランをお伝えする',
    '無料オンライン相談（30分）を実施しております。ご希望の方は下記よりご予約ください。',
    '▼ 無料相談のご予約はこちら',
    reserveUrl,
    '',
    'ご不明点や無料相談のご希望がございましたら、本メールにそのままご返信いただいても結構です。',
    '',
    '────────────────',
    'CoreGen',
    '代表 星野 創吉',
    'X: https://x.com/Sokichi_Hoshino',
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
    + '<p>御社の現状をお伺いし、AI活用による売上最大化の具体的なプランをお伝えする'
    + '<b>無料オンライン相談（30分）</b>を実施しております。ご希望の方は下記よりご予約ください。</p>'
    + '<p><a href="' + reserveUrl + '" '
    + 'style="display:inline-block;background:#121213;color:#fff;text-decoration:none;'
    + 'padding:12px 28px;border-radius:40px;font-weight:700;">無料相談を予約する</a></p>'
    + '<p style="font-size:13px;color:#677070;">ご不明点や無料相談のご希望がございましたら、本メールにそのままご返信いただいても結構です。</p>'
    + '<hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">'
    + '<p style="font-size:13px;color:#677070;">CoreGen<br>代表 星野 創吉<br>'
    + 'X: <a href="https://x.com/Sokichi_Hoshino">@Sokichi_Hoshino</a></p>'
    + '</div>';
}

function escapeHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
