import { filterObject, type JSONSerializable } from '@/utils';

export class Contacts implements JSONSerializable {
  email?: string | null;
  fb?: string | null;
  ig?: string | null;
  phone?: string | null;
  web?: string | null;

  constructor({
    email,
    fb,
    ig,
    phone,
    web,
  }: {
    email?: string | null;
    fb?: string | null;
    ig?: string | null;
    phone?: string | null;
    web?: string | null;
  }) {
    this.email = email;
    this.fb = fb;
    this.ig = ig;
    this.phone = phone;
    this.web = web;
  }

  public toJSON(): any {
    const json = {
      email: this.email,
      fb: this.fb,
      ig: this.ig,
      phone: this.phone,
      web: this.web,
    };

    return filterObject(json, {
      filterNull: true,
      filterUndefined: true,
      filterEmptyString: true,
    });
  }
}
