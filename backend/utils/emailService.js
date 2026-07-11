// emailService.js - Handles all email sending

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// =============================================
// Generate Invoice PDF
// =============================================
const generateInvoicePDF = (order, customer) => {
  const { jsPDF } = require('jspdf');
  const doc   = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const dark   = [26, 15, 19];
  const rose   = [192, 86, 106];
  const muted  = [154, 112, 128];
  const border = [237, 232, 233];
  const white  = [255, 255, 255];
  const cream  = [255, 250, 249];

  // Background
  doc.setFillColor(...cream);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Left accent bar
  doc.setFillColor(...dark);
  doc.rect(0, 0, 6, pageH, 'F');

  // Header
  doc.setFillColor(...white);
  doc.rect(6, 0, pageW - 6, 55, 'F');
  doc.setFillColor(...rose);
  doc.rect(6, 54, pageW - 6, 1, 'F');

  // Brand name
  doc.setTextColor(...dark);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('WomenShop', 18, 22);

  doc.setTextColor(...muted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Empowering Women Entrepreneurs', 18, 30);
  doc.text('womenshop.lk', 18, 37);

  // INVOICE label
  doc.setTextColor(...dark);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageW - 18, 22, { align: 'right' });

  // Order number badge
  doc.setFillColor(...dark);
  doc.roundedRect(pageW - 52, 26, 34, 10, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${order._id.toString().slice(-6).toUpperCase()}`, pageW - 35, 33, { align: 'center' });

  // Right accent bars
  doc.setFillColor(...rose);
  doc.rect(pageW - 12, 8,  10, 6, 'F');
  doc.rect(pageW - 12, 17, 10, 6, 'F');
  doc.rect(pageW - 12, 26, 10, 6, 'F');

  // Order meta box
  let y = 65;
  doc.setFillColor(...white);
  doc.roundedRect(14, y, pageW - 28, 28, 3, 3, 'F');
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, pageW - 28, 28, 3, 3, 'S');

  doc.setTextColor(...muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDER DATE',     22,  y + 9);
  doc.text('PAYMENT',        72,  y + 9);
  doc.text('STATUS',         132, y + 9);
  doc.text('ORDER ID',       168, y + 9);

  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(
    new Date(order.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
    22, y + 20
  );
  doc.text(order.paymentMethod || 'Cash on Delivery', 72,  y + 20);
  doc.text(order.status        || 'Pending',           132, y + 20);
  doc.text(`#${order._id.toString().slice(-6)}`,       168, y + 20);

  // Bill To
  y = 103;
  doc.setFillColor(...white);
  doc.roundedRect(14, y, 85, 42, 3, 3, 'F');
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 85, 42, 3, 3, 'S');
  doc.setFillColor(...rose);
  doc.roundedRect(14, y, 85, 7, 3, 3, 'F');
  doc.rect(14, y + 4, 85, 3, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', 22, y + 5);
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.name || 'Customer', 22, y + 18);
  doc.setTextColor(...muted);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.email || '', 22, y + 26);

  // Ship To
  doc.setFillColor(...white);
  doc.roundedRect(107, y, 87, 42, 3, 3, 'F');
  doc.setDrawColor(...border);
  doc.roundedRect(107, y, 87, 42, 3, 3, 'S');
  doc.setFillColor(...dark);
  doc.roundedRect(107, y, 87, 7, 3, 3, 'F');
  doc.rect(107, y + 4, 87, 3, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIP TO', 115, y + 5);
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.name || 'Customer', 115, y + 18);
  doc.setTextColor(...muted);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(order.shippingAddress?.street || '', 115, y + 26);
  doc.text(
    `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.province || ''}`,
    115, y + 33
  );
  doc.text(order.shippingAddress?.zipCode || '', 115, y + 40);

  // Table header
  y = 156;
  doc.setFillColor(...dark);
  doc.roundedRect(14, y, pageW - 28, 11, 2, 2, 'F');
  doc.rect(14, y + 6, pageW - 28, 5, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCT',    22,         y + 7.5);
  doc.text('QTY',        130,        y + 7.5, { align: 'center' });
  doc.text('UNIT PRICE', 158,        y + 7.5, { align: 'center' });
  doc.text('SUBTOTAL',   pageW - 20, y + 7.5, { align: 'right' });

  // Table rows
  y += 14;
  const subtotal = order.orderItems?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  order.orderItems?.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(250, 247, 248);
    } else {
      doc.setFillColor(...white);
    }
    doc.rect(14, y - 4, pageW - 28, 13, 'F');

    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.name || '', 22, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.text(String(item.quantity), 130, y + 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...muted);
    doc.text(`LKR ${item.price?.toLocaleString()}`, 158, y + 4, { align: 'center' });

    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.text(`LKR ${(item.price * item.quantity)?.toLocaleString()}`, pageW - 20, y + 4, { align: 'right' });

    y += 13;
  });

  // Totals
  y += 5;
  doc.setDrawColor(...border);
  doc.setLineWidth(0.4);
  doc.line(14, y - 5, pageW - 14, y - 5);

  doc.setTextColor(...muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('SUBTOTAL',        pageW - 80, y);
  doc.text(`LKR ${subtotal.toLocaleString()}`, pageW - 30, y, { align: 'right' });

  y += 9;
  doc.text('DELIVERY CHARGE', pageW - 80, y);
  doc.text('LKR 450.00',      pageW - 30, y, { align: 'right' });

  y += 5;
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.line(pageW - 90, y, pageW - 30, y);

  y += 8;
  doc.setFillColor(...dark);
  doc.roundedRect(pageW - 90, y, 76, 22, 3, 3, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL AMOUNT', pageW - 52, y + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`LKR ${(subtotal + 450).toLocaleString()}`, pageW - 52, y + 17, { align: 'center' });

  // Thank you note
  y += 35;
  doc.setDrawColor(...border);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageW - 14, y);
  y += 12;
  doc.setTextColor(...muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for shopping with WomenShop!', pageW / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(8);
  doc.text('We appreciate your support for women entrepreneurs.', pageW / 2, y, { align: 'center' });

  // Footer
  doc.setFillColor(...dark);
  doc.rect(0, pageH - 16, pageW, 16, 'F');
  doc.setFillColor(...rose);
  doc.rect(0, pageH - 17, pageW, 1, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('WomenShop © 2026',              18,         pageH - 7);
  doc.text('Empowering Women Entrepreneurs', pageW / 2,  pageH - 7, { align: 'center' });
  doc.text('womenshop.lk',                  pageW - 18, pageH - 7, { align: 'right' });

  return doc.output('arraybuffer');
};

// =============================================
// Send Order Confirmation Email
// =============================================
const sendOrderConfirmation = async (order, customer) => {
  const itemsHTML = order.orderItems.map(item => `
    <tr>
      <td style="padding:12px 16px; border-bottom:1px solid #f5e6e8; font-family:Arial,sans-serif; font-size:14px; color:#333;">
        ${item.name}
      </td>
      <td style="padding:12px 16px; border-bottom:1px solid #f5e6e8; font-family:Arial,sans-serif; font-size:14px; color:#333; text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:12px 16px; border-bottom:1px solid #f5e6e8; font-family:Arial,sans-serif; font-size:14px; color:#333; text-align:right;">
        LKR ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  // Generate PDF attachment
  let pdfAttachment = null;
  try {
    const pdfBuffer = generateInvoicePDF(order, customer);
    pdfAttachment = {
      filename:    `WomenShop-Invoice-${order._id.toString().slice(-6)}.pdf`,
      content:     Buffer.from(pdfBuffer),
      contentType: 'application/pdf',
    };
  } catch (pdfErr) {
    console.error('PDF generation error:', pdfErr.message);
  }

  const mailOptions = {
    from:    `"WomenShop" <${process.env.EMAIL_USER}>`,
    to:      customer.email,
    subject: `Order Confirmed! #${order._id.toString().slice(-6)} — WomenShop`,
    attachments: pdfAttachment ? [pdfAttachment] : [],
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background:#f9f0ff; font-family:Arial,sans-serif;">

        <div style="max-width:600px; margin:40px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(192,86,106,0.12);">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#8c3a4e 0%,#c0566a 60%,#e8a0ad 100%); padding:40px 32px; text-align:center;">
            <div style="font-size:32px; margin-bottom:10px;">🌸</div>
            <h1 style="margin:0; color:white; font-size:26px; font-weight:600;">WomenShop</h1>
            <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:15px;">Your order has been confirmed!</p>
          </div>

          <!-- Body -->
          <div style="padding:32px;">

            <h2 style="margin:0 0 8px; color:#1a0f13; font-size:20px;">Hi ${customer.name}!</h2>
            <p style="margin:0 0 24px; color:#6b4050; font-size:14px; line-height:1.6;">
              Thank you for shopping with us! Your order has been received and is now being processed.
              Your invoice is attached to this email as a PDF.
            </p>

            <!-- Order Info Box -->
            <table width="100%" style="background:#fdf0f2; border:1px solid #f2cdd4; border-radius:10px; margin-bottom:24px; border-collapse:collapse;">
              <tr>
                <td style="padding:13px 20px; border-bottom:1px solid #f2cdd4;">
                  <span style="font-size:11px; color:#9a7080; text-transform:uppercase; letter-spacing:0.08em;">Order ID</span>
                  <span style="float:right; font-size:14px; font-weight:700; color:#c0566a;">#${order._id.toString().slice(-6)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 20px; border-bottom:1px solid #f2cdd4;">
                  <span style="font-size:11px; color:#9a7080; text-transform:uppercase; letter-spacing:0.08em;">Date</span>
                  <span style="float:right; font-size:13px; color:#1a0f13;">${new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 20px; border-bottom:1px solid #f2cdd4;">
                  <span style="font-size:11px; color:#9a7080; text-transform:uppercase; letter-spacing:0.08em;">Payment</span>
                  <span style="float:right; font-size:13px; color:#1a0f13;">${order.paymentMethod}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 20px;">
                  <span style="font-size:11px; color:#9a7080; text-transform:uppercase; letter-spacing:0.08em;">Status</span>
                  <span style="float:right; background:#ecfdf5; color:#065f46; padding:3px 10px; border-radius:6px; font-size:12px; font-weight:600;">${order.status}</span>
                </td>
              </tr>
            </table>

            <!-- Items Table -->
            <table width="100%" style="border-collapse:collapse; margin-bottom:20px; border:1px solid #f5e6e8; border-radius:10px; overflow:hidden;">
              <thead>
                <tr style="background:#faf7f8;">
                  <th style="padding:12px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#9a7080;">Product</th>
                  <th style="padding:12px 16px; text-align:center; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#9a7080;">Qty</th>
                  <th style="padding:12px 16px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#9a7080;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
              <tfoot>
                <tr style="background:#fdf0f2;">
                  <td colspan="2" style="padding:14px 16px; font-weight:600; font-size:15px; color:#1a0f13;">Total</td>
                  <td style="padding:14px 16px; text-align:right; font-weight:600; font-size:18px; color:#c0566a;">
                    LKR ${order.totalPrice.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Shipping Address -->
            <table width="100%" style="background:#f9f7f8; border-radius:10px; margin-bottom:20px;">
              <tr>
                <td style="padding:16px 20px;">
                  <div style="font-size:13px; font-weight:600; color:#1a0f13; margin-bottom:10px;">
                    📦 Shipping Address
                  </div>
                  <div style="font-size:13px; color:#6b4050; line-height:1.8;">
                    ${order.shippingAddress.street}<br/>
                    ${order.shippingAddress.city}, ${order.shippingAddress.province}<br/>
                    ${order.shippingAddress.zipCode}
                  </div>
                </td>
              </tr>
            </table>

            <!-- What happens next -->
            <table width="100%" style="background:#f9f7f8; border-radius:10px; margin-bottom:24px; border-collapse:collapse;">
              <tr>
                <td style="padding:16px 20px 8px;">
                  <div style="font-size:13px; font-weight:600; color:#1a0f13;">
                    🚚 What happens next?
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px; border-bottom:1px solid #ede8e9;">
                  <table><tr>
                    <td style="width:28px; vertical-align:middle;">
                      <div style="width:22px; height:22px; background:#c0566a; border-radius:50%; text-align:center; line-height:22px; font-size:11px; color:white; font-weight:700;">✓</div>
                    </td>
                    <td style="padding-left:10px; vertical-align:middle; font-size:13px; color:#1a0f13; font-weight:500;">Order received &amp; confirmed</td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px; border-bottom:1px solid #ede8e9;">
                  <table><tr>
                    <td style="width:28px; vertical-align:middle;">
                      <div style="width:22px; height:22px; background:#ede8e9; border-radius:50%; text-align:center; line-height:22px; font-size:11px; color:#9a7080; font-weight:700;">2</div>
                    </td>
                    <td style="padding-left:10px; vertical-align:middle; font-size:13px; color:#9a7080;">Seller is preparing your order</td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px; border-bottom:1px solid #ede8e9;">
                  <table><tr>
                    <td style="width:28px; vertical-align:middle;">
                      <div style="width:22px; height:22px; background:#ede8e9; border-radius:50%; text-align:center; line-height:22px; font-size:11px; color:#9a7080; font-weight:700;">3</div>
                    </td>
                    <td style="padding-left:10px; vertical-align:middle; font-size:13px; color:#9a7080;">Your order will be shipped soon</td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px 16px;">
                  <table><tr>
                    <td style="width:28px; vertical-align:middle;">
                      <div style="width:22px; height:22px; background:#ede8e9; border-radius:50%; text-align:center; line-height:22px; font-size:11px; color:#9a7080; font-weight:700;">4</div>
                    </td>
                    <td style="padding-left:10px; vertical-align:middle; font-size:13px; color:#9a7080;">Delivered to your doorstep</td>
                  </tr></table>
                </td>
              </tr>
            </table>

            <p style="font-size:13px; color:#9a7080; text-align:center; line-height:1.6;">
              Your invoice PDF is attached to this email.<br/>
              If you have any questions, feel free to contact us!
            </p>

          </div>

          <!-- Footer -->
          <div style="background:#1a0f13; padding:24px 32px; text-align:center;">
            <p style="margin:0; color:rgba(255,255,255,0.6); font-size:13px;">
              © 2026 WomenShop — Empowering Women Entrepreneurs
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// =============================================
// Send Order Status Update Email
// =============================================
const sendStatusUpdateEmail = async (order, customer) => {
  const statusMessages = {
    Processing: {
      emoji: '⚙️',
      color: '#1e40af',
      bg:    '#eff6ff',
      msg:   'Your order is currently being processed by the seller.',
      next:  'Your order will be shipped soon!',
    },
    Shipped: {
      emoji: '🚚',
      color: '#166534',
      bg:    '#f0fdf4',
      msg:   'Great news! Your order is on its way to you.',
      next:  'Expected delivery in 2-5 business days.',
    },
    Delivered: {
      emoji: '🎉',
      color: '#065f46',
      bg:    '#ecfdf5',
      msg:   'Your order has been delivered! We hope you love it.',
      next:  'Please leave a review to help other shoppers!',
    },
    Cancelled: {
      emoji: '❌',
      color: '#991b1b',
      bg:    '#fef2f2',
      msg:   'Your order has been cancelled.',
      next:  'If you have any questions, please contact us.',
    },
  };

  const statusInfo = statusMessages[order.status];
  if (!statusInfo) return;

  const mailOptions = {
    from:    `"WomenShop" <${process.env.EMAIL_USER}>`,
    to:      customer.email,
    subject: `Order ${order.status}: #${order._id.toString().slice(-6)} — WomenShop`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f9f0ff; font-family:Arial,sans-serif;">
        <div style="max-width:600px; margin:40px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(192,86,106,0.12);">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#8c3a4e 0%,#c0566a 60%,#e8a0ad 100%); padding:40px 32px; text-align:center;">
            <div style="font-size:48px; margin-bottom:12px;">${statusInfo.emoji}</div>
            <h1 style="margin:0; color:white; font-size:24px; font-weight:600;">Order ${order.status}</h1>
            <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">WomenShop</p>
          </div>

          <!-- Body -->
          <div style="padding:32px;">
            <h2 style="margin:0 0 8px; color:#1a0f13;">Hi ${customer.name}!</h2>
            <p style="color:#6b4050; font-size:14px; line-height:1.6; margin-bottom:24px;">${statusInfo.msg}</p>

            <!-- Order Info -->
            <table width="100%" style="background:${statusInfo.bg}; border-radius:10px; margin-bottom:20px; border-collapse:collapse;">
              <tr>
                <td style="padding:13px 20px; border-bottom:1px solid rgba(0,0,0,0.06);">
                  <span style="font-size:11px; color:#9a7080; text-transform:uppercase; letter-spacing:0.08em;">Order ID</span>
                  <span style="float:right; font-size:14px; font-weight:700; color:${statusInfo.color};">#${order._id.toString().slice(-6)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 20px; border-bottom:1px solid rgba(0,0,0,0.06);">
                  <span style="font-size:11px; color:#9a7080; text-transform:uppercase; letter-spacing:0.08em;">Status</span>
                  <span style="float:right; background:${statusInfo.color}; color:white; padding:3px 12px; border-radius:6px; font-size:12px; font-weight:600;">${order.status}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 20px; border-bottom:1px solid rgba(0,0,0,0.06);">
                  <span style="font-size:11px; color:#9a7080; text-transform:uppercase; letter-spacing:0.08em;">Total</span>
                  <span style="float:right; font-size:14px; font-weight:600; color:#c0566a;">LKR ${order.totalPrice.toLocaleString()}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 20px;">
                  <span style="font-size:11px; color:#9a7080; text-transform:uppercase; letter-spacing:0.08em;">Payment</span>
                  <span style="float:right; font-size:13px; color:#1a0f13;">${order.paymentMethod}</span>
                </td>
              </tr>
            </table>

            <!-- Next Steps -->
            <div style="background:#f9f7f8; border-radius:10px; padding:16px 20px; margin-bottom:24px;">
              <div style="font-size:13px; color:#6b4050; line-height:1.6;">
                <strong>What's next?</strong><br/>
                ${statusInfo.next}
              </div>
            </div>

            <p style="font-size:13px; color:#9a7080; text-align:center;">
              Thank you for shopping with WomenShop!
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#1a0f13; padding:24px; text-align:center;">
            <p style="margin:0; color:rgba(255,255,255,0.6); font-size:13px;">
              © 2026 WomenShop — Empowering Women Entrepreneurs
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOrderConfirmation, sendStatusUpdateEmail };