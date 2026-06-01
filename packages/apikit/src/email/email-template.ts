/**
 * Represents the resolved structure of an email template.
 *
 * @template TData - Type of the data passed to the template.
 */
export interface EmailTemplate<TData extends object = object> {
  data: TData;
  recipient: string;
  sender: string;
  subject: string;
  templatePath: string;
  fallbackPath?: string;
  replyTo?: string;
}

/**
 * Input used to construct an email template.
 *
 * @template TData - Type of the data passed to the template.
 */
export type EmailTemplateInput<TData extends object> = {
  data: TData;
  recipient: string;
  sender?: string;
  replyTo?: string;
  subject?: string;
};

/**
 * Abstract base class to simplify creating email templates.
 *
 * @template TData - Type of the data passed to the template.
 */
export abstract class BaseEmailTemplate<TData extends object> implements EmailTemplate<TData> {
  data: TData;
  recipient: string;
  sender: string;
  subject: string;
  replyTo?: string;

  constructor(input: EmailTemplateInput<TData>) {
    this.data = input.data;
    this.recipient = input.recipient;
    this.sender = input.sender ?? this.defaultSender();
    this.subject = input.subject ?? this.defaultSubject();

    if (input.replyTo !== undefined) {
      this.replyTo = input.replyTo;
    }
  }

  /**
   * Provides the relative path to the EJS template file.
   */
  public abstract get templatePath(): string;

  /**
   * Provides an optional fallback path to the EJS template.
   */
  public get fallbackPath(): string | undefined {
    return undefined;
  }

  /**
   * Provides a default sender if none is explicitly passed.
   */
  protected abstract defaultSender(): string;

  /**
   * Provides a default subject if none is explicitly passed.
   */
  protected abstract defaultSubject(): string;
}
