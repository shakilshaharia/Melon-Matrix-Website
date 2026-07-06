const nodemailer = require("nodemailer");
const Setting = require("../models/Setting");
const { invalidateSettingsCache } = require("../middleware/locals");

// Transporter is rebuilt whenever settings change (see invalidate()) so an
// admin editing SMTP config in the panel takes effect immediately.
let cachedTransporter = null;
let cachedSignature = null;

function signatureOf(cfg) {
  return JSON.stringify([cfg.smtp_host, cfg.smtp_port, cfg.smtp_user, cfg.smtp_password, cfg.smtp_secure, cfg.smtp_debug]);
}

function invalidate() {
  cachedTransporter = null;
  cachedSignature = null;
}

async function getConfig() {
  const s = await Setting.all();
  return {
    enabled: s.smtp_enabled === "1",
    smtp_host: (s.smtp_host || "").trim(),
    smtp_port: Number(s.smtp_port || 587),
    smtp_secure: s.smtp_secure === "1",
    smtp_debug: s.smtp_debug === "1",
    // Gmail App Passwords are shown by Google with spaces for readability
    // ("abcd efgh ijkl mnop") — strip all whitespace so a copy-paste doesn't
    // silently break auth.
    smtp_user: (s.smtp_user || "").trim(),
    smtp_password: (s.smtp_password || "").replace(/\s+/g, ""),
    from_name: s.smtp_from_name || s.site_name || "Melon Matrix",
    // Many providers (Gmail included) require — or strongly prefer — the From
    // address to match the authenticated account, otherwise they silently
    // rewrite it or reject the message. Default to the SMTP username.
    from_email: s.smtp_from_email || s.smtp_user || s.email_primary || "",
    to_email: s.email_primary || s.smtp_from_email || s.smtp_user || "",
  };
}

// Known ports imply a transport mode; this protects against the checkbox and
// port being set inconsistently (the #1 cause of silent SMTP failures).
function resolveSecure(port, secureFlag) {
  if (port === 465) return true; // implicit TLS
  if (port === 587 || port === 25) return false; // STARTTLS
  return secureFlag;
}

async function getTransporter() {
  const cfg = await getConfig();
  if (!cfg.enabled || !cfg.smtp_host || !cfg.smtp_user) return { transporter: null, cfg };

  const sig = signatureOf(cfg);
  if (cachedTransporter && cachedSignature === sig) return { transporter: cachedTransporter, cfg };

  const secure = resolveSecure(cfg.smtp_port, cfg.smtp_secure);
  cachedTransporter = nodemailer.createTransport({
    host: cfg.smtp_host,
    port: cfg.smtp_port,
    secure,
    requireTLS: !secure, // force STARTTLS upgrade on 587/25 instead of silently sending in the clear
    auth: { user: cfg.smtp_user, pass: cfg.smtp_password },
    // Fail fast (default nodemailer timeouts run 2+ minutes) so a bad host/port/
    // firewall reads as a clear error instead of an email that "never arrives".
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    logger: cfg.smtp_debug,
    debug: cfg.smtp_debug,
  });
  cachedSignature = sig;
  return { transporter: cachedTransporter, cfg };
}

// Turns a raw SMTP/nodemailer error into an actionable hint. Gmail's own error
// text is accurate but terse — most people don't know "Invalid login" for a
// Google account means "you need an App Password", not your account password.
function explain(err, host) {
  const msg = err && err.message ? err.message : String(err);
  const isGmail = /gmail|google/i.test(host || "");

  if (isGmail && /invalid login|username and password not accepted|5\.7\.(8|9)/i.test(msg)) {
    return `${msg} — Gmail rejected the username/password. Gmail requires an App Password (not your normal Google password): turn on 2-Step Verification, then create one at https://myaccount.google.com/apppasswords and paste it here (spaces are fine, they're stripped automatically).`;
  }
  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/i.test(err && err.code) || /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(msg)) {
    return `${msg} — could not reach ${host || "the SMTP host"}. Check the host/port are correct and that your network/firewall/antivirus isn't blocking outbound SMTP.`;
  }
  if (/self.signed certificate|unable to verify the first certificate/i.test(msg)) {
    return `${msg} — a network in between (proxy/antivirus) may be intercepting the TLS connection.`;
  }
  if (/Missing credentials for "PLAIN"/i.test(msg)) {
    return `${msg} — the SMTP username or password is empty. Fill in both and save before testing.`;
  }
  return msg;
}

// Records the outcome of the most recent send attempt so it's visible on the
// Settings page — without this, a failed contact-form notification was only
// ever visible in the server's console log, invisible to the admin.
async function recordStatus(ok, detail) {
  try {
    await Setting.setMany({
      smtp_last_status: ok ? "ok" : "error",
      smtp_last_detail: (detail || "").slice(0, 500),
      smtp_last_at: new Date().toISOString(),
    });
    invalidateSettingsCache();
  } catch (err) {
    console.error("mailer.recordStatus failed:", err.message);
  }
}

// Returns { sent: boolean, reason?: string }. Never throws — callers use this
// for best-effort notifications (e.g. contact form) that shouldn't block the request.
async function sendMail({ to, subject, text, html, replyTo }) {
  const { transporter, cfg } = await getTransporter();
  if (!transporter) {
    const reason = "SMTP is not configured or disabled.";
    await recordStatus(false, reason);
    return { sent: false, reason };
  }

  try {
    await transporter.sendMail({
      from: `"${cfg.from_name}" <${cfg.from_email}>`,
      to: to || cfg.to_email,
      replyTo,
      subject,
      text,
      html,
    });
    await recordStatus(true, `Sent to ${to || cfg.to_email}`);
    return { sent: true };
  } catch (err) {
    const reason = explain(err, cfg.smtp_host);
    console.error("mailer.sendMail failed:", reason);
    await recordStatus(false, reason);
    return { sent: false, reason };
  }
}

// Used by the admin "Send test email" button — throws on failure so the
// caller can show the exact SMTP error instead of a generic message.
async function verifyAndSendTest(toOverride) {
  const { transporter, cfg } = await getTransporter();
  if (!transporter) {
    const reason = "SMTP is not configured or disabled. Fill in host, user and password, then enable SMTP.";
    await recordStatus(false, reason);
    throw new Error(reason);
  }

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"${cfg.from_name}" <${cfg.from_email}>`,
      to: toOverride || cfg.to_email,
      subject: "Melon Matrix — SMTP test email",
      text: "If you're reading this, your SMTP settings are working correctly.",
      html: "<p>If you're reading this, your SMTP settings are working correctly.</p>",
    });
    await recordStatus(true, `Test email sent to ${toOverride || cfg.to_email}`);
  } catch (err) {
    const reason = explain(err, cfg.smtp_host);
    await recordStatus(false, reason);
    throw new Error(reason);
  }
}

module.exports = { sendMail, verifyAndSendTest, invalidate };
