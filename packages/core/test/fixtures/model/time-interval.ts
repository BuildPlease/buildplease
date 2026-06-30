import { TimeInterval } from '@/model/time-interval';

export function makeInterval(value: string | number): TimeInterval {
  return new TimeInterval(value);
}
