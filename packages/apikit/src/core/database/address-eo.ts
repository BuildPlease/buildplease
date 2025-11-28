import { prop, modelOptions } from '@typegoose/typegoose';

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
  streetLine2?: string;

  @prop({ required: true, type: () => String })
  city!: string;

  @prop({ required: false, type: () => String })
  postalCode?: string;

  @prop({ required: false, type: () => String })
  state?: string;

  @prop({ required: true, type: () => String })
  country!: string;

  @prop({ required: false, type: () => String })
  countryCode?: string;
}
