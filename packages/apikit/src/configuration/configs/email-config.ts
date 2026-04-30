export interface EmailConfig {
  /**
   * Enables email sending.
   *
   * When set to false, email sending attempts are rejected.
   *
   * @required
   */
  enabled: boolean;

  /**
   * Base path to the directory containing email templates.
   *
   * @optional
   * @default resolvePath(process.cwd(), "./src/templates")
   *
   * @example resolvePath(import.meta.url, './src/templates/email')
   */
  templatesPath: string;

  /**
   * Global values injected into every email template.
   *
   * Client-defined values override framework defaults with the same key.
   *
   * @optional
   * @default {}
   */
  globals: Record<string, unknown>;
}
