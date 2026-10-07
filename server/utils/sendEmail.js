/**
 * =========================================================================
 * Email Service Utility (utils/sendEmail.js)
 * =========================================================================
 * Handles sending real OTP email messages to users via Nodemailer.
 */

const nodemailer = require('nodemailer');

/**
 * Sends an email containing OTP verification code using Nodemailer.
 * @param {object} params - { toEmail, otpCode }
 */
const sendOtpEmail = async ({ toEmail, otpCode }) => {
  try {
    let transporter;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback Ethereal test transporter if explicit SMTP env variables are not provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"TaskFlow Security" <${process.env.SMTP_USER || 'no-reply@taskflow.app'}>`,
      to: toEmail,
      subject: '🔑 TaskFlow - Your Password Reset OTP Code',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #6366f1; margin: 0; font-size: 24px;">TaskFlow</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset Verification Code</p>
          </div>
          <div style="background-color: #f8fafc; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #cbd5e1;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; font-weight: 500;">Your 6-digit OTP code is:</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6366f1; font-family: monospace;">${otpCode}</div>
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">Valid for 10 minutes. Do not share this code with anyone.</p>
          </div>
          <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Password reset OTP sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send OTP email via Nodemailer:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
};
