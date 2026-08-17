import { type Readable, PassThrough } from 'stream';
import { pipeline as pipelineAsync } from 'stream/promises';

import { type UnitFormatterController, ByteUnit, CoreSymbols } from '@buildplease/core';
import { inject, injectable } from 'inversify';
import type { Metadata } from 'sharp';
import sharp from 'sharp';

import { ApiErrorFactory } from '@/error';
import { FormatType } from '@/formatter';

import type { ImageOptions, SharpFormat, SharpInstance } from './image-options';

export interface ImageNormalizationController {
  processBufferToBuffer(input: Buffer, options?: ImageOptions): Promise<{ buffer: Buffer; type: FormatType }>;
  processBufferToStream(input: Buffer, options?: ImageOptions): Promise<{ stream: Readable; type: FormatType }>;
  processStreamToBuffer(input: Readable, options?: ImageOptions): Promise<{ buffer: Buffer; type: FormatType }>;
  processStreamToStream(input: Readable, options?: ImageOptions): Promise<{ stream: Readable; type: FormatType }>;
}

@injectable()
export class ImageNormalizationControllerImpl implements ImageNormalizationController {
  constructor(
    @inject(CoreSymbols.DI.Formatter.UnitController)
    private readonly formatter: UnitFormatterController,
  ) {}

  async processBufferToBuffer(input: Buffer, options?: ImageOptions) {
    const { processed, type } = await this.transform(sharp(input), options);
    const buffer = await processed.toBuffer();
    return { buffer: buffer, type: type };
  }

  async processBufferToStream(input: Buffer, options?: ImageOptions) {
    const { processed, type } = await this.transform(sharp(input), options);
    const stream = this.asReadable(processed);
    return { stream: stream, type: type };
  }

  async processStreamToBuffer(input: Readable, options?: ImageOptions) {
    const image = sharp();
    await pipelineAsync(input, image);
    const { processed, type } = await this.transform(image, options);
    const buffer = await processed.toBuffer();
    return { buffer: buffer, type: type };
  }

  async processStreamToStream(input: Readable, options?: ImageOptions) {
    const image = sharp();
    await pipelineAsync(input, image);
    const { processed, type } = await this.transform(image, options);
    const stream = this.asReadable(processed);
    return { stream: stream, type: type };
  }

  // MARK: - Private

  private async transform(
    imageIn: SharpInstance,
    inputOptions?: ImageOptions,
  ): Promise<{ processed: SharpInstance; type: FormatType }> {
    const options = inputOptions ?? this.makeDefaultOptions();

    let meta: Metadata;

    try {
      meta = await imageIn.metadata();
    } catch {
      throw ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT', {
        details: 'Invalid or unsupported image file',
      });
    }

    this.validateMaximumSize(meta.size, options.maximumSize);
    this.validateInputFormat(meta.format, options.allowedInputFormats);

    let instance = await this.applyNormalization(imageIn, meta, options);

    const outputFormat = this.toSharpFormat(options.outputFormat);
    const { sharp: sharpOptions } = options;
    instance = sharpOptions?.toFormat
      ? instance.toFormat(outputFormat, sharpOptions.toFormat)
      : instance.toFormat(outputFormat);

    if (sharpOptions?.configure) {
      instance = sharpOptions.configure(instance);
    }

    const type = this.toFormatType(options.outputFormat);
    return { processed: instance, type: type };
  }

  private validateInputFormat(format: SharpFormat | undefined, allowed?: SharpFormat[]) {
    if (!format || !sharp.format[format]?.input) {
      throw ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT', {
        details: `Unsupported input format: ${format}`,
      });
    }

    if (allowed && !allowed.includes(format)) {
      throw ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT', {
        details: `Format not allowed: ${format}`,
      });
    }
  }

  private validateMaximumSize(currentSize: number | undefined, maxSize: number | undefined): void {
    if (!maxSize || !currentSize) return;

    if (currentSize > maxSize) {
      const formatted = this.formatter.formatBytes(maxSize, {
        inputUnit: ByteUnit.Byte,
        outputUnit: 'auto',
        decimals: 1,
      });

      throw ApiErrorFactory.make('Image.MAX_SIZE_EXCEEDED', {
        i18n: {
          specs: { maxSize: formatted.value, unit: formatted.unit },
        },
        details: `current=${currentSize}B, max=${maxSize}B, exceeded=${currentSize - maxSize}B`,
      });
    }
  }

  private toSharpFormat(format: ImageOptions['outputFormat']): SharpFormat {
    return format as SharpFormat;
  }

  private toFormatType(format: ImageOptions['outputFormat']): FormatType {
    const formatInfo = this.getFormatInfo(format);

    if (!formatInfo?.output) {
      const message = `Cannot encode output format: ${format}`;
      throw ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT', { details: message });
    }
    return new FormatType(format);
  }

  private getFormatInfo(format: string): { input?: boolean; output?: boolean } | undefined {
    const formats = sharp.format as unknown as Record<string, { input?: boolean; output?: boolean } | undefined>;

    return formats[format];
  }
  private asReadable(instance: SharpInstance): Readable {
    const out = new PassThrough();
    instance.on('error', (error: Error) => out.destroy(error));
    instance.pipe(out);
    return out;
  }

  // MARK: - Helpers

  private async applyNormalization(
    instance: SharpInstance,
    meta: Metadata,
    options: ImageOptions,
  ): Promise<SharpInstance> {
    const hasConstraints =
      options.minWidth != null ||
      options.maxWidth != null ||
      options.minAspectRatio != null ||
      options.maxAspectRatio != null;

    // No constraints → honor caller resize (if any) and return
    if (!hasConstraints) {
      if (options.sharp?.resize) instance = instance.resize(options.sharp.resize);
      return instance;
    }

    this.validateConstraints(options);

    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (!(width > 0 && height > 0)) {
      throw ApiErrorFactory.make('Validation.INVALID_PROPERTIES', {
        details: 'Missing image dimensions.',
      });
    }

    // Crop to the allowed aspect-ratio band (centered) if outside bounds
    const tolerance = options.aspectRatioTolerance ?? 0;
    const aspectRatio = width / height;
    const targetAR = this.pickTargetAspectRatio(aspectRatio, options.minAspectRatio, options.maxAspectRatio, tolerance);

    let currentWidth = width; // track width to avoid re-reading metadata
    if (targetAR !== undefined) {
      const tooWide = aspectRatio > targetAR;
      const cropW = tooWide ? Math.max(1, Math.round(height * targetAR)) : width;
      const cropH = tooWide ? height : Math.max(1, Math.round(width / targetAR));

      const left = Math.max(0, Math.floor((width - cropW) / 2));
      const top = Math.max(0, Math.floor((height - cropH) / 2));

      instance = instance.extract({ left: left, top: top, width: cropW, height: cropH });
      currentWidth = cropW;
    }

    // Clamp width into [minWidth, maxWidth] with a single resize (keeps AR)
    const { minWidth, maxWidth } = options;
    const clampedWidth =
      typeof maxWidth === 'number' && currentWidth > maxWidth
        ? maxWidth
        : typeof minWidth === 'number' && currentWidth < minWidth
          ? minWidth
          : currentWidth;

    if (clampedWidth !== currentWidth) {
      instance = instance.resize({ width: clampedWidth });
    }

    return instance;
  }

  private validateConstraints(options: ImageOptions): void {
    const problems: string[] = [];

    const isPositive = (n: number) => Number.isFinite(n) && n > 0;
    const isNonNegative = (n: number) => Number.isFinite(n) && n >= 0;

    if (options.minWidth != null && !isPositive(options.minWidth)) problems.push('minWidth must be > 0');
    if (options.maxWidth != null && !isPositive(options.maxWidth)) problems.push('maxWidth must be > 0');
    if (options.minAspectRatio != null && !isPositive(options.minAspectRatio))
      problems.push('minAspectRatio must be > 0');
    if (options.maxAspectRatio != null && !isPositive(options.maxAspectRatio))
      problems.push('maxAspectRatio must be > 0');
    if (options.aspectRatioTolerance != null && !isNonNegative(options.aspectRatioTolerance))
      problems.push('aspectRatioTolerance must be ≥ 0');

    if (options.minWidth != null && options.maxWidth != null && options.minWidth > options.maxWidth) {
      problems.push('minWidth must be ≤ maxWidth');
    }
    if (
      options.minAspectRatio != null &&
      options.maxAspectRatio != null &&
      options.minAspectRatio > options.maxAspectRatio
    ) {
      problems.push('minAspectRatio must be ≤ maxAspectRatio');
    }

    if (problems.length) {
      throw ApiErrorFactory.make('Validation.INVALID_PROPERTIES', { details: problems.join('; ') });
    }
  }

  private pickTargetAspectRatio(current: number, minAR?: number, maxAR?: number, tol = 0): number | undefined {
    if (typeof minAR === 'number' && current < minAR - tol) return minAR;
    if (typeof maxAR === 'number' && current > maxAR + tol) return maxAR;
    return undefined;
  }

  private makeDefaultOptions(): ImageOptions {
    return {
      outputFormat: 'jpeg',
      maximumSize: 7.5 * 1024 * 1024,
      minWidth: 320,
      maxWidth: 1080,
      minAspectRatio: 0.8, // 4:5
      maxAspectRatio: 1.91, // 1.91:1
      aspectRatioTolerance: 0.01,
      sharp: {
        toFormat: { quality: 82, progressive: true },
      },
    };
  }
}
