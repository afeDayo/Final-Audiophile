// ============================================================
// utils/emailService.ts
// Handles all outgoing emails using the Brevo API (formerly Sendinblue).
//
// Brevo sends over HTTPS (port 443), same as SendGrid/Resend —
// which is why it works on Render's free tier where outbound raw
// SMTP (port 587/465) is blocked. Nodemailer + Gmail SMTP failed
// with ETIMEDOUT/ESOCKET errors for exactly that networking reason.
//
// Brevo's free tier gives 300 emails/day forever — the most
// generous of the free HTTPS-based providers — and only requires
// verifying a single SENDER EMAIL (no DNS records, no domain).
//
// Emails sent:
// 1. Order confirmation — sent to customer after every purchase
// 2. Welcome email      — sent when a new user registers
// ============================================================

// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";
import { IOrder } from "../types/indexServer";

// ─────────────────────────────────────────────
// CLIENT SETUP
// Brevo's SDK uses a slightly different pattern than
// SendGrid/Resend — you configure the default API client
// globally, then create a TransactionalEmailsApi instance.
// ─────────────────────────────────────────────
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications["api-key"];
apiKeyAuth.apiKey = process.env.BREVO_API_KEY as string;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// The verified sender email — MUST match exactly what you verified
// in Brevo under Senders, Domains & Dedicated IPs → Senders
const SENDER_EMAIL = process.env.EMAIL_FROM || "your.verified.email@gmail.com";
const SENDER_NAME = "Audiophile Nigeria";

// ─────────────────────────────────────────────
// HELPER: Format a number as currency
// e.g. 2999 → "$2,999"
// ─────────────────────────────────────────────
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString("en-US")}`;
};

// ─────────────────────────────────────────────
// HELPER: Format a date string nicely
// e.g. "2024-01-15T..." → "January 15, 2024"
// ─────────────────────────────────────────────
const formatDate = (dateStr: string | Date): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ─────────────────────────────────────────────
// HELPER: Status badge color for the email
// ─────────────────────────────────────────────
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "#F59E0B",
    processing: "#3B82F6",
    shipped: "#8B5CF6",
    delivered: "#10B981",
    cancelled: "#EF4444",
  };
  return colors[status] || "#6B7280";
};

// ─────────────────────────────────────────────
// TEMPLATE: Order Confirmation Email HTML
// (Same branded template used throughout this project)
// ─────────────────────────────────────────────
const buildOrderConfirmationHTML = (order: IOrder): string => {
  const itemRows = order.cartItems
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #F1F1F1;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:60px;vertical-align:middle;">
                <img src="${item.image}" alt="${item.name}" width="50" height="50"
                  style="border-radius:8px;object-fit:contain;background:#F9F6F1;" />
              </td>
              <td style="padding-left:12px;vertical-align:middle;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0D0D0D;">${item.name}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">
                  ${formatCurrency(item.price)} × ${item.quantity}
                </p>
              </td>
              <td style="text-align:right;vertical-align:middle;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0D0D0D;">
                  ${formatCurrency(item.price * item.quantity)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `,
    )
    .join("");

  const eMoneySection =
    order.customerInfo.paymentMethod === "e-Money"
      ? `
      <tr>
        <td style="padding:4px 0;">
          <span style="font-size:13px;color:#6B7280;">e-Money Number:</span>
          <span style="font-size:13px;font-weight:600;color:#0D0D0D;float:right;">
            ****${order.customerInfo.eMoneyNumber?.slice(-4) || "****"}
          </span>
        </td>
      </tr>
    `
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation — Audiophile Nigeria</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F6F1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#0D0D0D;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:8px;color:#ffffff;text-transform:uppercase;">
                audio<span style="color:#D87D4A;">phile</span>
              </p>
              <p style="margin:8px 0 0;font-size:12px;font-weight:600;letter-spacing:3px;color:rgba(255,255,255,0.4);text-transform:uppercase;">
                Nigeria's Premium Audio Store
              </p>
            </td>
          </tr>
          <tr><td style="height:4px;background:linear-gradient(90deg,#D87D4A,#FBAF85);"></td></tr>
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="width:64px;height:64px;background:#FFF3E8;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/5610/5610944.png" alt="✓" width="32" height="32" style="display:block;margin:16px auto;" />
              </div>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#0D0D0D;letter-spacing:-0.5px;">
                Thank You For Your Order!
              </h1>
              <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.6;">
                Hi <strong style="color:#0D0D0D;">${order.customerInfo.name.split(" ")[0]}</strong>,
                we've received your order and it's being processed.
                You'll get another email when it ships.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F1;border-radius:12px;padding:20px 24px;">
                <tr><td style="padding:6px 0;"><table width="100%"><tr>
                  <td style="font-size:13px;color:#6B7280;font-weight:500;">Order ID</td>
                  <td style="font-size:13px;font-weight:800;color:#0D0D0D;text-align:right;">${order.orderId}</td>
                </tr></table></td></tr>
                <tr><td style="padding:6px 0;"><table width="100%"><tr>
                  <td style="font-size:13px;color:#6B7280;font-weight:500;">Order Date</td>
                  <td style="font-size:13px;font-weight:700;color:#0D0D0D;text-align:right;">${formatDate(order.createdAt)}</td>
                </tr></table></td></tr>
                <tr><td style="padding:6px 0;"><table width="100%"><tr>
                  <td style="font-size:13px;color:#6B7280;font-weight:500;">Status</td>
                  <td style="text-align:right;">
                    <span style="display:inline-block;background:${getStatusColor(order.status)}22;color:${getStatusColor(order.status)};font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:999px;">${order.status}</span>
                  </td>
                </tr></table></td></tr>
                <tr><td style="padding:6px 0;"><table width="100%"><tr>
                  <td style="font-size:13px;color:#6B7280;font-weight:500;">Payment</td>
                  <td style="font-size:13px;font-weight:700;color:#0D0D0D;text-align:right;">${order.customerInfo.paymentMethod}</td>
                </tr></table></td></tr>
                ${eMoneySection}
              </table>
            </td>
          </tr>
          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #F1F1F1;margin:0;" /></td></tr>
          <tr>
            <td style="padding:24px 40px;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:800;color:#0D0D0D;text-transform:uppercase;letter-spacing:1px;">
                Items Ordered
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F1;border-radius:12px;padding:20px 24px;">
                <tr><td style="padding:5px 0;"><table width="100%"><tr>
                  <td style="font-size:13px;color:#6B7280;">Subtotal</td>
                  <td style="font-size:13px;font-weight:600;color:#0D0D0D;text-align:right;">${formatCurrency(order.orderSummary.subtotal)}</td>
                </tr></table></td></tr>
                <tr><td style="padding:5px 0;"><table width="100%"><tr>
                  <td style="font-size:13px;color:#6B7280;">Shipping</td>
                  <td style="font-size:13px;font-weight:600;color:#0D0D0D;text-align:right;">${formatCurrency(order.orderSummary.shipping)}</td>
                </tr></table></td></tr>
                <tr><td style="padding:5px 0;"><table width="100%"><tr>
                  <td style="font-size:13px;color:#6B7280;">VAT (20%)</td>
                  <td style="font-size:13px;font-weight:600;color:#0D0D0D;text-align:right;">${formatCurrency(order.orderSummary.vat)}</td>
                </tr></table></td></tr>
                <tr><td style="padding:12px 0 0;border-top:1px solid #E8E3DC;"><table width="100%"><tr>
                  <td style="font-size:15px;font-weight:800;color:#0D0D0D;">Grand Total</td>
                  <td style="font-size:18px;font-weight:900;color:#D87D4A;text-align:right;">${formatCurrency(order.orderSummary.grandTotal)}</td>
                </tr></table></td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px;">
              <h2 style="margin:0 0 12px;font-size:16px;font-weight:800;color:#0D0D0D;text-transform:uppercase;letter-spacing:1px;">
                Delivery Address
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F1;border-radius:12px;padding:20px 24px;">
                <tr><td>
                  <p style="margin:0;font-size:14px;font-weight:700;color:#0D0D0D;">${order.customerInfo.name}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#6B7280;line-height:1.6;">
                    ${order.customerInfo.address}<br/>
                    ${order.customerInfo.city}, ${order.customerInfo.zipCode}<br/>
                    ${order.customerInfo.country}
                  </p>
                  <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">
                    📞 ${order.customerInfo.phone}
                  </p>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/orders"
                style="display:inline-block;background:#D87D4A;color:#ffffff;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:4px;">
                View My Orders
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#0D0D0D;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:900;letter-spacing:6px;color:#D87D4A;text-transform:uppercase;">
                audiophile
              </p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;">
                Nigeria's Premium Audio Store<br/>
                Questions? Reply to this email or contact us at support@audiophile.ng
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:rgba(255,255,255,0.2);">
                © ${new Date().getFullYear()} Audiophile Nigeria. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// ─────────────────────────────────────────────
// TEMPLATE: Welcome Email HTML
// (Sent when a new user registers an account)
// ─────────────────────────────────────────────
const buildWelcomeEmailHTML = (name: string): string => {
  const firstName = name.split(" ")[0];
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Audiophile Nigeria</title>
</head>
<body style="margin:0;padding:0;background:#F9F6F1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#0D0D0D;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:8px;color:#fff;text-transform:uppercase;">
                audio<span style="color:#D87D4A;">phile</span>
              </p>
            </td>
          </tr>
          <tr><td style="height:4px;background:linear-gradient(90deg,#D87D4A,#FBAF85);"></td></tr>
          <tr>
            <td style="padding:48px 40px;text-align:center;">
              <p style="font-size:40px;margin:0 0 20px;">🎧</p>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:900;color:#0D0D0D;">
                Welcome, ${firstName}!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.7;max-width:420px;margin-left:auto;margin-right:auto;">
                Your Audiophile Nigeria account is ready. You now have access to order history,
                saved addresses, and a faster checkout experience.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F1;border-radius:12px;padding:20px 24px;text-align:left;margin-bottom:28px;">
                <tr><td style="padding:8px 0;font-size:14px;color:#0D0D0D;">🛒 &nbsp;<strong>Cart saved</strong> — your items stay between sessions</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#0D0D0D;">📦 &nbsp;<strong>Order history</strong> — track every purchase</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#0D0D0D;">⚡ &nbsp;<strong>Faster checkout</strong> — saved address pre-fills the form</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#0D0D0D;">🖼️ &nbsp;<strong>Custom avatar</strong> — personalise your profile</td></tr>
              </table>
              <a href="${process.env.CLIENT_URL || "https://final-audiophile.vercel.app/"}"
                style="display:inline-block;background:#D87D4A;color:#fff;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:4px;">
                Start Shopping
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#0D0D0D;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:900;letter-spacing:6px;color:#D87D4A;text-transform:uppercase;">audiophile</p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);">
                © ${new Date().getFullYear()} Audiophile Nigeria. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// ═══════════════════════════════════════════════
// PUBLIC FUNCTIONS — same names/signatures as before,
// so your controllers (userController.ts, orderController.ts)
// need ZERO changes. Only this file and your .env change.
// ═══════════════════════════════════════════════

// Send order confirmation email after a successful purchase
export const sendOrderConfirmationEmail = async (
  order: IOrder,
): Promise<void> => {
  try {
    // Brevo's SDK uses a "SendSmtpEmail" object to describe the message
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
    sendSmtpEmail.to = [{ email: order.customerInfo.email }]; // Works for ANY recipient
    sendSmtpEmail.subject = `✅ Order Confirmed — ${order.orderId} | Audiophile Nigeria`;
    sendSmtpEmail.htmlContent = buildOrderConfirmationHTML(order);

    const response = await emailApi.sendTransacEmail(sendSmtpEmail);

    console.log(
      `✅ Order confirmation email sent to ${order.customerInfo.email} — Message ID: ${response.messageId}`,
    );
  } catch (err: any) {
    // Brevo errors include detail in err.response?.body — log it fully
    console.error(
      "❌ Brevo order confirmation error:",
      err.response?.body || err.message || err,
    );
  }
};

// Send welcome email when a new user registers
export const sendWelcomeEmail = async (
  name: string,
  email: string,
): Promise<void> => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
    sendSmtpEmail.to = [{ email }]; // Works for ANY recipient
    sendSmtpEmail.subject = `🎧 Welcome to Audiophile Nigeria, ${name.split(" ")[0]}!`;
    sendSmtpEmail.htmlContent = buildWelcomeEmailHTML(name);

    const response = await emailApi.sendTransacEmail(sendSmtpEmail);

    console.log(
      `✅ Welcome email sent to ${email} — Message ID: ${response.messageId}`,
    );
  } catch (err: any) {
    console.error(
      "❌ Brevo welcome email error:",
      err.response?.body || err.message || err,
    );
  }
};
