/**
 * Global defaults automatically injected into every email template.
 */
export interface EmailTemplateGlobalDefaults {
  /**
   * Short, UTC-based timestamp of when the email was generated.
   * Example: "2025-09-25 12:34 UTC"
   */
  generatedDate: string;
}

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

  /**
   * @property {Record<string, unknown>} [globals]
   * Global values automatically injected into every email template.
   *
   * The framework also injects global defaults (see {@link EmailTemplateRuntimeDefaults}).
   * Will be possibly overridden by client-defined values from this config.
   */
  globals?: Record<string, unknown>;
}
