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
  static toDomain(input?: ContactsEo | null): Contacts | null {
    if (!input) return null;

    return new Contacts({
      email: input.email ?? null,
      fb: input.fb ?? null,
      ig: input.ig ?? null,
      phone: input.phone ?? null,
      web: input.web ?? null,
    });
  }

  static toEo(input?: Contacts | null): ContactsEo | undefined {
    if (!input) return undefined;

    return Object.assign(new ContactsEo(), {
      email: input.email ?? null,
      fb: input.fb ?? null,
      ig: input.ig ?? null,
      phone: input.phone ?? null,
      web: input.web ?? null,
    });
  }

  static toPartialEo(input?: DeepPartial<Contacts> | null): DeepPartial<ContactsEo> | undefined {
    if (!input) return undefined;

    const output: DeepPartial<ContactsEo> = {
      email: input.email,
      fb: input.fb,
      ig: input.ig,
      phone: input.phone,
      web: input.web,
    };

    return output;
  }
}
