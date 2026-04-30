import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { optional } from '@meawkit/core';
import ejs from 'ejs';
import { inject, injectable } from 'inversify';
import nodemailer from 'nodemailer';

import type { ApiKitController } from '@/configuration';
import { ApiKitSymbols } from '@/di';
import type { EmailTemplate } from '@/email';
import type { LoggerController } from '@/logger';

const LOG_PREFIX = '[Email]:';

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  sender: string;
};

export interface EmailController {
  sendEmail(template: EmailTemplate): Promise<void>;
}

@injectable()
export class EmailControllerImpl implements EmailController {
  private transporter?: nodemailer.Transporter;

  private readonly templatesPath: string;
  private readonly isEnabled: boolean;
  private readonly smtpConfig: SmtpConfig;

  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private readonly configuration: ApiKitController,
    @inject(ApiKitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
  ) {
    this.isEnabled = this.configuration.email.enabled;
    this.smtpConfig = makeSmtpConfig(this.isEnabled);
    this.templatesPath = makeTemplatesPath(this.configuration.email.templatesPath);
  }

  // MARK: - Public

  async sendEmail(template: EmailTemplate): Promise<void> {
    try {
      if (!this.isEnabled) {
        this.logger.debug(`${LOG_PREFIX} Sending skipped — disabled`);
        return;
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
      this.logger.error(`${LOG_PREFIX} Send failed`, { error: error });
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
      this.logger.error(`${LOG_PREFIX} Render failed`, { error: error });
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

    throw new Error(
      `${LOG_PREFIX} Template not found: ${primary}${fallbackPath ? ` or ${fallbackPath}` : ''}`,
    );
  }

  private makeGlobals() {
    const clientDefined = this.configuration.email.globals;

    const runtimeDefaults = {
      generatedDate: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
    };

    return {
      ...runtimeDefaults,
      ...clientDefined,
    };
  }

  private sanitizeTemplatePath(templatePath: string): string {
    if (templatePath.includes('..')) {
      throw new Error(`${LOG_PREFIX} Invalid template path: ${templatePath}`);
    }

    const cleanedPath = templatePath.replace(/^\/+/, '');
    return cleanedPath.endsWith('.ejs') ? cleanedPath : cleanedPath + '.ejs';
  }
}

function makeSmtpConfig(enabled: boolean): SmtpConfig {
  if (!enabled) return { host: '', port: 0, user: '', pass: '', sender: '' };

  const read = (key: string): string => {
    return optional(process.env[key]).orThrow(new Error(`${LOG_PREFIX} Missing ${key}`));
  };

  const host = read('SMTP_HOST');
  const rawPort = read('SMTP_PORT');
  const user = read('SMTP_USER');
  const pass = read('SMTP_PASSWORD');
  const sender = read('SMTP_SENDER');

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`${LOG_PREFIX} SMTP_PORT must be a positive integer`);
  }

  return {
    host: host,
    port: port,
    user: user,
    pass: pass,
    sender: sender,
  };
}

function makeTemplatesPath(input: string): string {
  const value = input.trim();

  return path.isAbsolute(value) ? path.normalize(value) : path.resolve(process.cwd(), value);
}
