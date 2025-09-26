/**
 * Represents the structure of an email template.
 *
 * @template T - Type of the data passed to the template.
 */
export interface EmailTemplate<T = object> {
  data: T;
  recipient: string;
  sender?: string;
  replyTo?: string;
  subject: string;
  templatePath: string;
  fallbackPath?: string;
}

/**
 * Abstract base class to simplify creating email templates.
 *
 * @template T - Type of the data passed to the template.
 */
export abstract class BaseEmailTemplate<T extends object> implements EmailTemplate<T> {
  data: T;
  recipient: string;
  sender?: string;
  replyTo?: string;
  subject: string;

  constructor(params: { recipient: string; sender?: string; replyTo?: string; subject?: string; data: T }) {
    this.data = params.data;
    this.recipient = params.recipient;
    this.sender = params.sender;
    this.replyTo = params.replyTo;
    this.subject = params.subject ?? this.defaultSubject();
  }

  /**
   * Provides the relative path to the EJS template file (without `.ejs` extension).
   */
  abstract get templatePath(): string;

  /**
   * Provides an optional fallback path to the EJS template.
   *
   * @remarks
   * - This will only be used if the primary {@link templatePath} does not exist.
   *
   * @returns The relative fallback path to an EJS template, or `undefined`.
   */
  get fallbackPath(): string | undefined {
    return undefined;
  }

  /**
   * Provides a default subject if none is explicitly passed.
   */
  protected abstract defaultSubject(): string;
}
