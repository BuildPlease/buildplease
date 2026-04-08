import { injectable } from 'inversify';

import type { FormatBytesOptions, FormattedBytes } from '@/formatter';
import { ByteUnit } from '@/model';

export interface UnitFormatterController {
  /**
   * Formats a byte size into a human-readable value and unit.
   *
   * @param size
   *   Size expressed in the given input unit (or bytes by default).
   *
   * @param [options]
   *   Optional formatting options.
   *
   * @param [options.inputUnit]
   *   Unit of the input size.
   *   @default ByteUnit.Byte
   *
   * @param [options.outputUnit]
   *   Target unit. When 'auto', picks the largest unit with value ≥ 1.
   *   @default 'auto'
   *
   * @param [options.decimals]
   *   Number of decimal places to keep in the formatted value.
   *   @default 1
   *
   * @returns
   *   Formatted value with unit and the original size in bytes.
   *
   * @example
   *   // 1.0 MB
   *   formatter.formatBytes(1048576);
   *
   * @example
   *   // 512.00 KB
   *   formatter.formatBytes(512, {
   *     inputUnit: ByteUnit.Kilobyte,
   *     outputUnit: ByteUnit.Kilobyte,
   *     decimals: 2,
   *   });
   */
  formatBytes(size: number, options?: FormatBytesOptions): FormattedBytes;
}

@injectable()
export class UnitFormatterControllerImpl implements UnitFormatterController {
  formatBytes(size: number, options?: FormatBytesOptions): FormattedBytes {
    const { inputUnit = ByteUnit.Byte, outputUnit = 'auto', decimals = 1 } = options ?? {};

    const factorFor = (unit: ByteUnit): number => {
      if (unit === ByteUnit.Byte) return 1;
      if (unit === ByteUnit.Kilobyte) return 1024;
      if (unit === ByteUnit.Megabyte) return 1024 * 1024;
      if (unit === ByteUnit.Gigabyte) return 1024 * 1024 * 1024;
      return 1024 * 1024 * 1024 * 1024;
    };

    const bytes = size * factorFor(inputUnit);

    const pickAutoUnit = (): ByteUnit => {
      const units: ByteUnit[] = [ByteUnit.Terabyte, ByteUnit.Gigabyte, ByteUnit.Megabyte, ByteUnit.Kilobyte];

      for (const unit of units) {
        const value = bytes / factorFor(unit);
        if (value >= 1) return unit;
      }

      return ByteUnit.Byte;
    };

    const finalUnit = outputUnit === 'auto' ? pickAutoUnit() : outputUnit;
    const rawValue = bytes / factorFor(finalUnit);

    const factor = Math.pow(10, decimals);
    const rounded = Math.round(rawValue * factor) / factor;

    return {
      value: rounded,
      unit: finalUnit,
      bytes: bytes,
    };
  }
}
