// ============================================================
// utils/emailService.ts
// Handles all outgoing emails using Nodemailer + Gmail SMTP.
//
// Unlike Resend's free tier, Gmail SMTP has NO restriction on
// who you can send to — any recipient works immediately, with
// no domain verification required. This is ideal for student
// projects and demos.
//
// Emails sent:
// 1. Order confirmation — sent to customer after every purchase
// 2. Welcome email      — sent when a new user registers
// ============================================================

import nodemailer from "nodemailer";
import { IOrder } from "../types/indexServer";

// ─────────────────────────────────────────────
// TRANSPORTER SETUP
// A "transporter" is Nodemailer's term for the configured
// connection to an SMTP server — in our case, Gmail.
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for port 465, false for port 587 (TLS upgrade)
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your 16-character Gmail App Password
  },
});

// The "from" address shown to recipients
const FROM_ADDRESS =
  process.env.EMAIL_FROM || `Audiophile Nigeria <${process.env.EMAIL_USER}>`;

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString("en-US")}`;
};

const formatDate = (dateStr: string | Date): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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
              <a href="${process.env.CLIENT_URL || "https://final-audiophile-three.vercel.app/"}/orders"
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
// PUBLIC FUNCTIONS — same names/signatures as the Resend
// version, so your controllers don't need any changes.
// ═══════════════════════════════════════════════

export const sendOrderConfirmationEmail = async (
  order: IOrder,
): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: order.customerInfo.email, // Works for ANY recipient — no restriction
      subject: `✅ Order Confirmed — ${order.orderId} | Audiophile Nigeria`,
      html: buildOrderConfirmationHTML(order),
    });

    console.log(
      `✅ Order confirmation email sent — Message ID: ${info.messageId}`,
    );
  } catch (err) {
    console.error("❌ Nodemailer order confirmation error:", err);
  }
};

export const sendWelcomeEmail = async (
  name: string,
  email: string,
): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email, // Works for ANY recipient — no restriction
      subject: `🎧 Welcome to Audiophile Nigeria, ${name.split(" ")[0]}!`,
      html: buildWelcomeEmailHTML(name),
    });

    console.log(`✅ Welcome email sent — Message ID: ${info.messageId}`);
  } catch (err) {
    console.error("❌ Nodemailer welcome email error:", err);
  }
};
