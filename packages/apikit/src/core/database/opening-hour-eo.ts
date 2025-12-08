import { prop, modelOptions } from '@typegoose/typegoose';
import { DeepPartial, OpeningHour, type OpeningHourInterval } from '@nidavellirx/meowv-core';

@modelOptions({
  schemaOptions: {
    _id: false,
    id: false,
    autoIndex: false,
  },
})
export class OpeningHourIntervalEo {
  @prop({ required: true, type: () => String })
  open!: string;

  @prop({ required: true, type: () => String })
  close!: string;
}

@modelOptions({
  schemaOptions: {
    _id: false,
    id: false,
    autoIndex: false,
  },
})
export class OpeningHourEo {
  @prop({ required: true, type: () => Number })
  day!: number;

  @prop({ required: true, type: () => [OpeningHourIntervalEo], _id: false })
  intervals!: OpeningHourIntervalEo[];
}

export class OpeningHourEoConverter {
  static toDomain(input: OpeningHourEo): OpeningHour {
    const intervals: OpeningHourInterval[] =
      input.intervals?.map((item) => ({
        open: item.open,
        close: item.close,
      })) ?? [];

    return new OpeningHour(input.day, intervals);
  }

  static toEo(input: OpeningHour): OpeningHourEo {
    return Object.assign(new OpeningHourEo(), {
      day: input.day,
      intervals: input.intervals.map((item) =>
        Object.assign(new OpeningHourIntervalEo(), {
          open: item.open,
          close: item.close,
        }),
      ),
    });
  }

  static toPartialEo(input: DeepPartial<OpeningHour> | undefined): DeepPartial<OpeningHourEo> | undefined {
    if (!input) return undefined;

    const output: DeepPartial<OpeningHourEo> = {
      day: input.day,
      intervals: input.intervals?.map((item) => ({
        open: item?.open,
        close: item?.close,
      })),
    };

    return output;
  }
}
