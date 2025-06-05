/**
 * Represents the structure of an email template.
 *
 * @template T - Type of the data passed to the template.
 */
export interface EmailTemplate<T = object> {
  recipient: string;
  sender?: string;
  replyTo?: string;
  subject: string;
  templatePath: string;
  data?: T;
}

/**
 * Abstract base class to simplify creating email templates.
 *
 * @template T - Type of the data passed to the template.
 */
export abstract class BaseEmailTemplate<T extends object> implements EmailTemplate<T> {
  recipient: string;
  sender?: string;
  replyTo?: string;
  subject: string;
  data?: T;

  constructor(params: { recipient: string; sender?: string; replyTo?: string; subject?: string; data?: T }) {
    this.recipient = params.recipient;
    this.sender = params.sender;
    this.replyTo = params.replyTo;
    this.subject = params.subject ?? this.defaultSubject();
    this.data = params.data;
  }

  /**
   * Provides the relative path to the EJS template file (without `.ejs` extension).
   */
  abstract get templatePath(): string;

  /**
   * Provides a default subject if none is explicitly passed.
   */
  protected abstract defaultSubject(): string;
}
