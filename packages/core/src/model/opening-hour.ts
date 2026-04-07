import { type JSONSerializable, filterObject } from '@/utils';

export type OpeningHourInterval = {
  open: string;
  close: string;
};

export class OpeningHour implements JSONSerializable {
  day: number;
  intervals: OpeningHourInterval[];

  constructor(day: number, intervals: OpeningHourInterval[]) {
    this.day = day;
    this.intervals = intervals;
  }

  public toJSON(): any {
    const json = {
      day: this.day,
      intervals: this.intervals,
    };

    return filterObject(json, {
      filterNull: true,
      filterUndefined: true,
      filterEmptyString: true,
    });
  }
}
