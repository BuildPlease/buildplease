export interface MetricsConfig {
  /**
   * Whether Prometheus metrics endpoint is enabled.
   *
   * @optional
   * @default false
   */
  enabled: boolean;

  /**
   * HTTP endpoint where Prometheus metrics will be exposed.
   *
   * @optional
   * @default "/metrics"
   */
  endpoint: string;
}
