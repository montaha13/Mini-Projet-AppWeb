import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly mailFrom: string;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com';
    const port = this.configService.get<number>('MAIL_PORT') || 465;
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    this.mailFrom = user || 'noreply@smartroombooker.com';

    if (!user || !pass) {
      this.logger.warn('⚠️  MAIL_USER or MAIL_PASS is missing in .env — emails will NOT be sent.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,  // true for 465 (SSL), false for 587 (STARTTLS)
      auth: {
        user,
        pass,
      },
    });

    // Verify connection on startup
    this.transporter.verify()
      .then(() => this.logger.log('✅ SMTP connection verified — Gmail ready to send.'))
      .catch((err) => this.logger.error('❌ SMTP connection failed:', err.message));
  }

  async sendUserCredentials(email: string, generatedPassword: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"SmartRoomBooker" <${this.mailFrom}>`,
        to: email,
        subject: '🎉 Welcome to SmartRoomBooker — Your Login Credentials',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏢 SmartRoomBooker</h1>
              <p style="color: #e8e0ff; margin: 8px 0 0 0; font-size: 14px;">Intelligent Room Booking Platform</p>
            </div>

            <!-- Body -->
            <div style="padding: 30px; border: 1px solid #e8e8e8; border-top: none;">
              <h2 style="color: #333; margin-top: 0;">Welcome aboard! 👋</h2>
              <p style="color: #555; line-height: 1.6;">
                Your account has been created by an administrator. Use the credentials below to log in to your dashboard.
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f8f9ff; border: 1px solid #e0e4ff; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 13px;">📧 Login Email</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 13px; border-top: 1px solid #eee;">🔑 Temporary Password</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right; border-top: 1px solid #eee;">
                      <code style="background: #fff3e0; padding: 4px 10px; border-radius: 4px; font-size: 15px;">${generatedPassword}</code>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #555; line-height: 1.6;">
                For security reasons, we recommend changing your password after your first login.
              </p>

              <!-- Footer -->
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #aaa; font-size: 12px; text-align: center;">
                This is an automated message from SmartRoomBooker. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
      });

      this.logger.log(`✅ Credentials email sent successfully to ${email} (MessageId: ${info.messageId})`);
    } catch (error) {
      this.logger.error(`❌ Failed to send credentials email to ${email}:`, error.message);
    }
  }
}
