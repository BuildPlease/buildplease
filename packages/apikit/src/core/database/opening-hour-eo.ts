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
  @prop({
    required: true,
    type: () => String,
  })
  open!: string;

  @prop({
    required: true,
    type: () => String,
  })
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
  @prop({
    required: true,
    type: () => Number,
  })
  day!: number;

  @prop({
    _id: false,
    required: true,
    type: () => [OpeningHourIntervalEo],
    default: [],
  })
  intervals!: OpeningHourIntervalEo[];
}

export class OpeningHourEoConverter {
  // MARK: - To Domain

  static toDomain(input: OpeningHourEo): OpeningHour {
    const eoIntervals = input.intervals ?? [];

    const intervals: OpeningHourInterval[] = eoIntervals.map((eo) => ({
      open: eo.open,
      close: eo.close,
    }));

    return new OpeningHour(input.day, intervals);
  }

  static toDomainList(input?: OpeningHourEo[] | null): OpeningHour[] | null | undefined {
    if (input === undefined || input === null) return input;
    return input.map((eo) => OpeningHourEoConverter.toDomain(eo));
  }

  // MARK: - To Eo

  static toEo(input: OpeningHour): OpeningHourEo {
    return Object.assign(new OpeningHourEo(), {
      day: input.day,
      intervals: input.intervals.map((interval) =>
        Object.assign(new OpeningHourIntervalEo(), {
          open: interval.open,
          close: interval.close,
        }),
      ),
    });
  }

  static toEoList(input?: OpeningHour[] | null): OpeningHourEo[] | null | undefined {
    if (input === undefined || input === null) return input;
    return input.map((item) => OpeningHourEoConverter.toEo(item));
  }

  // MARK: - To Partial

  static toPartial(input: DeepPartial<OpeningHour> | undefined): DeepPartial<OpeningHourEo> | undefined {
    if (!input) return undefined;

    return {
      day: input.day,
      intervals: input.intervals?.map((interval) => ({
        open: interval?.open,
        close: interval?.close,
      })),
    };
  }

  static toPartialList(
    input?: DeepPartial<OpeningHour>[] | null,
  ): DeepPartial<OpeningHourEo>[] | null | undefined {
    if (input === undefined || input === null) return input;

    return input
      .map((item) => OpeningHourEoConverter.toPartial(item))
      .filter((item): item is DeepPartial<OpeningHourEo> => item !== undefined);
  }
}
