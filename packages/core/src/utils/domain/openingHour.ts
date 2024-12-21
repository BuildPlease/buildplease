export class OpeningHour {
  day: number;
  intervals: { open: string; close: string }[];

  constructor(day: number, intervals: { open: string; close: string }[]) {
    this.day = day;
    this.intervals = intervals;
  }
}
