import { prop, modelOptions } from '@typegoose/typegoose';
import { Contacts, DeepPartial } from '@nidavellirx/meowv-core';

@modelOptions({
  schemaOptions: {
    _id: false,
    id: false,
    autoIndex: false,
  },
})
export class ContactsEo {
  @prop({ required: false, type: () => String })
  email?: string | null;

  @prop({ required: false, type: () => String })
  fb?: string | null;

  @prop({ required: false, type: () => String })
  ig?: string | null;

  @prop({ required: false, type: () => String })
  web?: string | null;

  @prop({ required: false, type: () => String })
  phone?: string | null;
}

export class ContactsEoConverter {
  static toDomain(input: ContactsEo): Contacts {
    return new Contacts({
      email: input.email,
      facebook: input.fb,
      instagram: input.ig,
      phone: input.phone,
      web: input.web,
    });
  }

  static toEo(input: Contacts): ContactsEo {
    return Object.assign(new ContactsEo(), {
      email: input.email,
      fb: input.facebook,
      ig: input.instagram,
      phone: input.phone,
      web: input.web,
    });
  }

  static toPartialEo(input: DeepPartial<Contacts> | undefined): DeepPartial<ContactsEo> | undefined {
    if (!input) return undefined;

    const output: DeepPartial<ContactsEo> = {
      email: input.email,
      fb: input.facebook,
      ig: input.instagram,
      web: input.web,
      phone: input.phone,
    };

    return output;
  }
}
