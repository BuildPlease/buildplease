import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

import { injectable, inject } from 'inversify';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import { resolvePath } from '@meawkit/core/node';

import { ApiKitSymbols } from '@/di';
import type { EmailTemplate } from '@/email';
import type { LoggerController } from '@/logger';
import type { ApiKitController, EmailTemplateGlobalDefaults } from '@/configuration';

export interface EmailController {
  sendEmail(template: EmailTemplate): Promise<void>;
}

@injectable()
export class EmailControllerImpl implements EmailController {
  private transporter?: nodemailer.Transporter;
  private readonly templatesPath: string;
  private readonly isEnabled: boolean;
  private readonly smtpConfig: {
    host: string;
    port: number;
    user: string;
    pass: string;
    sender: string;
  };

  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private readonly configuration: ApiKitController,
    @inject(ApiKitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
  ) {
    this.isEnabled = this.configuration.email.enabled;
    this.templatesPath =
      this.configuration.email.templatesPath || resolvePath(process.cwd(), './src/templates');

    if (this.isEnabled) {
      this.smtpConfig = this.validateSmtpConfig();
    } else {
      this.smtpConfig = { host: '', port: 0, user: '', pass: '', sender: '' };
    }
  }

  // MARK: - Public

  async sendEmail(template: EmailTemplate): Promise<void> {
    try {
      if (!this.isEnabled) {
        throw new Error('Email sending is disabled.');
      }

      const transporter = this.getOrCreateTransporter();
      const recipient = template.recipient;
      const sender = template.sender || this.smtpConfig.sender;
      const subject = template.subject;
      const htmlContent = await this.renderTemplate(template);

      const mailOptions: any = {
        to: recipient,
        from: sender,
        subject,
        html: htmlContent,
      };

      if (template.replyTo) {
        mailOptions.replyTo = template.replyTo;
      }

      await transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error('Error while sending email', { error: error });
      throw error;
    }
  }

  // MARK: - Private

  private getOrCreateTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        auth: {
          user: this.smtpConfig.user,
          pass: this.smtpConfig.pass,
        },
      });
    }
    return this.transporter;
  }

  private async renderTemplate<T>(template: EmailTemplate<T>): Promise<string> {
    try {
      const filePath = this.makeFilePath(template.templatePath, template.fallbackPath);

      const templateString = await fs.readFile(filePath, 'utf-8');
      const data = { globals: this.makeGlobals(), ...template.data };
      return ejs.render(templateString, data);
    } catch (error) {
      throw error;
    }
  }

  private makeFilePath(templatePath: string, fallbackPath?: string): string {
    const primary = path.join(this.templatesPath, this.sanitizeTemplatePath(templatePath));
    if (existsSync(primary)) return primary;

    if (fallbackPath) {
      const fallback = path.join(this.templatesPath, this.sanitizeTemplatePath(fallbackPath));
      if (existsSync(fallback)) return fallback;
    }

    throw new Error(`Email template not found: ${primary}${fallbackPath ? ` or ${fallbackPath}` : ''}`);
  }
  private makeGlobals() {
    const clientDefined = this.configuration.email.globals ?? {};

    const runtimeDefaults: EmailTemplateGlobalDefaults = {
      generatedDate: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
    };

    return {
      ...runtimeDefaults,
      ...clientDefined,
    };
  }

  private validateSmtpConfig() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SENDER } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_SENDER) {
      throw new Error(
        'SMTP configuration is incomplete. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SENDER',
      );
    }

    const port = Number(SMTP_PORT);
    if (Number.isNaN(port) || port <= 0) {
      throw new Error('SMTP_PORT must be a valid positive number.');
    }

    return {
      host: SMTP_HOST,
      port: port,
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
      sender: SMTP_SENDER,
    };
  }

  private sanitizeTemplatePath(templatePath: string): string {
    if (templatePath.includes('..')) {
      throw new Error(`Invalid template path: ${templatePath}`);
    }

    const cleanedPath = templatePath.replace(/^\/+/, '');
    return cleanedPath.endsWith('.ejs') ? cleanedPath : cleanedPath + '.ejs';
  }
}
