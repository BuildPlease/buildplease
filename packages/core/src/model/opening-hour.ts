export type OpeningHourInterval = { open: string; close: string };

export class OpeningHour {
  day: number;
  intervals: OpeningHourInterval[];

  constructor(day: number, intervals: OpeningHourInterval[]) {
    this.day = day;
    this.intervals = intervals;
  }
}
