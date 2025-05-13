export interface EmailConfig {
  /**
   * Whether email sending is enabled.
   * If false, the EmailController will reject any sending attempts.
   *
   */
  enabled: boolean;

  /**
   * Base path to the folder containing email templates.
   * Must be an absolute file system path.
   * Should be resolved via `resolvePath`.
   *
   * @example
   * resolvePath(import.meta.url, './src/templates/email')
   *
   * @default
   * resolvePath(process.cwd(), './src/templates')
   */
  templatesPath?: string;
}
