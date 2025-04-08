import nodemailer from "nodemailer";
import { injectable } from "tsyringe";

import LoggerFactory from "./Logger";

@injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private logger = LoggerFactory.getLogger();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
    });
  }

  async sendWelcomeEmail(to: string) {
    try {
      const result = await this.transporter.sendMail({
        from: '"Gateway App" <no-reply@gateway.local>',
        to,
        subject: "👋 Welcome!",
        text: `Thanks for signing up, ${to.split("@")[0]}!`,
        html: `<p>Welcome, <strong>${to}</strong>! 🎉</p>`,
      });

      this.logger.info(`📤 Email sent to ${to}: ${result.messageId}`);
    } catch (err) {
      this.logger.error(`❌ Failed to send email to ${to}:`, err);
    }
  }
}
