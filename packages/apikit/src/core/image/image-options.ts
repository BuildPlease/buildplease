import type sharp from 'sharp';
import type { Sharp } from 'sharp';

/**
 * Shared options applied to every image configuration.
 */
type Base = {
  maximumSize?: number;

  /**
   * Direct passthrough for Sharp configuration.
   *
   * @remarks
   * If any normalization constraints (`minWidth`, `maxWidth`, `minAspectRatio`, `maxAspectRatio`)
   * are provided, they take precedence. When no constraints are provided, `resize` is applied.
   */
  sharp?: {
    /** Optional resize transformation applied before encoding. Mirrors `sharp.resize()` options. */
    resize?: sharp.ResizeOptions;

    /**
     * Low-level hook executed after framework transforms and before output.
     * Must return the same `Sharp` instance (mutated) or a new pipeline.
     *
     * @example
     * ```ts
     * configure: s => s.rotate().withMetadata()
     * ```
     */
    configure?: (instance: Sharp) => Sharp;
  };
};

/** Mapping of encoder-specific options keyed by output format. */
type OutputOptionsMap = {
  jpeg: sharp.JpegOptions;
  png: sharp.PngOptions;
  webp: sharp.WebpOptions;
  avif: sharp.AvifOptions;
  heif: sharp.HeifOptions;
  tiff: sharp.TiffOptions;
  jp2: sharp.Jp2Options;
  jxl: sharp.JxlOptions;
  gif: sharp.GifOptions;
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
