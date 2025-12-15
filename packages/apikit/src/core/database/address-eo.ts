import { prop, modelOptions } from '@typegoose/typegoose';
import { type DeepPartial, Address } from '@nidavellirx/meowv-core';

@modelOptions({
  schemaOptions: {
    _id: false,
    id: false,
    autoIndex: false,
  },
})
export class AddressEo {
  @prop({ required: true, type: () => String })
  streetLine1!: string;

  @prop({ required: false, type: () => String })
  streetLine2?: string | null;

  @prop({ required: false, type: () => String })
  postalCode?: string | null;

  @prop({ required: false, type: () => String })
  state?: string | null;

  @prop({ required: true, type: () => String })
  city?: string | null;

  @prop({ required: true, type: () => String })
  country!: string;

  @prop({ required: false, type: () => String })
  countryCode?: string | null;
}

export class AddressEoConverter {
  static toDomain(input: AddressEo): Address {
    return new Address({
      streetLine1: input.streetLine1,
      streetLine2: input.streetLine2,
      postalCode: input.postalCode,
      state: input.state,
      city: input.city,
      country: input.country,
      countryCode: input.countryCode,
    });
  }

  static toEo(input: Address): AddressEo {
    return Object.assign(new AddressEo(), {
      streetLine1: input.streetLine1,
      streetLine2: input.streetLine2,
      postalCode: input.postalCode,
      state: input.state,
      city: input.city,
      country: input.country,
      countryCode: input.countryCode,
    });
  }

  static toPartialEo(input: DeepPartial<Address> | undefined): DeepPartial<AddressEo> | undefined {
    if (!input) return undefined;

    const output: DeepPartial<AddressEo> = {
      streetLine1: input.streetLine1,
      streetLine2: input.streetLine2,
      postalCode: input.postalCode,
      state: input.state,
      city: input.city,
      country: input.country,
      countryCode: input.countryCode,
    };

    return output;
  }
}
