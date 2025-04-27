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
   *
   * If not provided, defaults to `resolvePath(process.cwd(), './src/templates/email')`.
   *
   * @example
   * // When setting manually, resolve from your app root:
   * resolvePath(import.meta.url, './src/templates/email')
   *
   * @default
   * resolvePath(process.cwd(), './src/templates/email')
   */
  templatesBasePath?: string;
}
