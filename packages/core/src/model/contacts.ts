import { filterObject, type JSONSerializable } from '@/utils';

export class Contacts implements JSONSerializable {
  email?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  phone?: string | null;
  web?: string | null;

  constructor({
    email,
    facebook,
    instagram,
    phone,
    web,
  }: {
    email?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    phone?: string | null;
    web?: string | null;
  }) {
    this.email = email;
    this.facebook = facebook;
    this.instagram = instagram;
    this.phone = phone;
    this.web = web;
  }

  public toJSON(): any {
    const json = {
      email: this.email,
      fb: this.facebook,
      ig: this.instagram,
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
