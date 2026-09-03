import { type JSONSerializable, filterObject } from '@neutral/utils';

export class Address implements JSONSerializable {
  streetLine1: string;
  streetLine2?: string | null;
  postalCode?: string | null;
  state?: string | null;
  city?: string | null;
  country: string;
  countryCode?: string | null;

  constructor(input: {
    streetLine1: string;
    streetLine2?: string | null;
    postalCode?: string | null;
    state?: string | null;
    city?: string | null;
    country: string;
    countryCode?: string | null;
  }) {
    this.streetLine1 = input.streetLine1;
    this.streetLine2 = input.streetLine2;
    this.postalCode = input.postalCode;
    this.state = input.state;
    this.city = input.city;
    this.country = input.country;
    this.countryCode = input.countryCode;
  }

  public toJSON(): any {
    const json = {
      streetLine1: this.streetLine1,
      streetLine2: this.streetLine2,
      postalCode: this.postalCode,
      city: this.city,
      state: this.state,
      country: this.country,
      countryCode: this.countryCode,
    };

    return filterObject(json, {
      filterNull: true,
      filterUndefined: true,
      filterEmptyString: true,
    });
  }

  public formatted(): string {
    const buildSection = (parts: Array<string | null | undefined>, separator: string): string => {
      return parts
        .map((part) => part?.trim())
        .filter((part) => part && part.length > 0)
        .join(separator)
        .trim();
    };

    const streetSection = this.streetLine1;
    const citySection = buildSection([this.postalCode, this.city], ' ');
    const regionSection = buildSection([this.country], ', ');

    return buildSection([streetSection, citySection, regionSection], ', ');
  }
}
