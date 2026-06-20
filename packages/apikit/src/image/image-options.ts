import type {
  AvifOptions,
  FormatEnum,
  GifOptions,
  HeifOptions,
  Jp2Options,
  JpegOptions,
  JxlOptions,
  PngOptions,
  ResizeOptions,
  Sharp,
  TiffOptions,
  WebpOptions,
} from 'sharp';

/**
 * Runtime Sharp pipeline instance.
 */
export type SharpInstance = Sharp;

/**
 * Sharp format key accepted by the normalization pipeline.
 */
export type SharpFormat = Extract<keyof FormatEnum, string>;

/**
 * Shared options applied to every image configuration.
 */
type Base = {
  maximumSize?: number;
  allowedInputFormats?: SharpFormat[];

  /**
   * Direct passthrough for Sharp configuration.
   *
   * @remarks
   * If any normalization constraints (`minWidth`, `maxWidth`, `minAspectRatio`, `maxAspectRatio`)
   * are provided, they take precedence. When no constraints are provided, `resize` is applied.
   */
  sharp?: {
    /** Optional resize transformation applied before encoding. Mirrors `sharp.resize()` options. */
    resize?: ResizeOptions;

    /**
     * Low-level hook executed after framework transforms and before output.
     * Must return the same Sharp pipeline instance (mutated) or a new pipeline.
     *
     * @example
     * ```ts
     * configure: s => s.rotate().withMetadata()
     * ```
     */
    configure?: (instance: SharpInstance) => SharpInstance;
  };
};

/** Mapping of encoder-specific options keyed by output format. */
type OutputOptionsMap = {
  jpeg: JpegOptions;
  png: PngOptions;
  webp: WebpOptions;
  avif: AvifOptions;
  heif: HeifOptions;
  tiff: TiffOptions;
  jp2: Jp2Options;
  jxl: JxlOptions;
  gif: GifOptions;
};

/**
 * Image normalization options describing validation and encoding.
 */
export type ImageOptions = {
  [F in keyof OutputOptionsMap]: Base & {
    /**
     * Target encoder/format for the processed output.
     * Determines the allowed type of `sharp.toFormat` options below.
     */
    outputFormat: F;

    /**
     * Sharp passthrough:
     * - `resize` (honored only when no normalization constraints are present)
     * - `toFormat` options (passed to `sharp.toFormat(outputFormat, toFormat)`).
     */
    sharp?: Base['sharp'] & {
      /** Options passed to `sharp.toFormat(outputFormat, toFormat)` */
      toFormat?: OutputOptionsMap[F];
    };
  };
}[keyof OutputOptionsMap] & {
  /** Minimum target width (e.g., 320). */
  minWidth?: number;
  /** Maximum target width (e.g., 1080). */
  maxWidth?: number;
  /** Minimum supported aspect ratio (width/height), e.g., 0.8 (4:5). */
  minAspectRatio?: number;
  /** Maximum supported aspect ratio (width/height), e.g., 1.91 (1.91:1). */
  maxAspectRatio?: number;
  /** Aspect-ratio comparison tolerance (e.g., 0.01). */
  aspectRatioTolerance?: number;
};
