import { UnitFormatterImpl } from '@neutral/formatter/unit-formatter';
import { ByteUnit } from '@neutral/model/unit';
import { describe, expect, it } from 'vitest';

describe('UnitFormatter', () => {
  const formatter = new UnitFormatterImpl();

  it('formats bytes using automatic units', () => {
    expect(formatter.formatBytes(1_048_576)).toEqual({
      value: 1,
      unit: ByteUnit.Megabyte,
      bytes: 1_048_576,
    });
  });

  it('formats using explicit input and output units', () => {
    expect(
      formatter.formatBytes(512, {
        inputUnit: ByteUnit.Kilobyte,
        outputUnit: ByteUnit.Kilobyte,
        decimals: 2,
      }),
    ).toEqual({
      value: 512,
      unit: ByteUnit.Kilobyte,
      bytes: 524_288,
    });
  });
});
