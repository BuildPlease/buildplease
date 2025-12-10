import { ByteUnit } from '@/model';

export interface FormatBytesOptions {
  inputUnit?: ByteUnit;
  outputUnit?: ByteUnit | 'auto';
  decimals?: number;
}

export interface FormattedBytes {
  value: number;
  unit: ByteUnit;
  bytes: number;
}
