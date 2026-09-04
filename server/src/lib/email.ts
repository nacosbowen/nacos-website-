import { BrevoClient } from '@getbrevo/brevo';

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

export async function sendVerificationEmail(toEmail: string, code: string) {
  await brevo.transactionalEmails.sendTransacEmail({
    subject: 'Verify your NACOS account',
    sender: { email: process.env.BREVO_SENDER_EMAIL!, name: 'NACOS Bowen' },
    to: [{ email: toEmail }],
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Your NACOS verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(toEmail: string, resetLink: string) {
  await brevo.transactionalEmails.sendTransacEmail({
    subject: 'Reset your NACOS password',
    sender: { email: process.env.BREVO_SENDER_EMAIL!, name: 'NACOS Bowen' },
    to: [{ email: toEmail }],
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Click the link below to reset your NACOS account password:</p>
        <p><a href="${resetLink}" style="display:inline-block; padding:10px 20px; background:#111; color:#fff; text-decoration:none; border-radius:8px;">Reset Password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}