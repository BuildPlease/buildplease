import { filterObject, type JSONSerializable } from '@/utils';

export class Contacts implements JSONSerializable {
  email?: string;
  facebook?: string;
  instagram?: string;
  phone?: string;

  constructor({
    email,
    facebook,
    instagram,
    phone,
  }: {
    email?: string;
    facebook?: string;
    instagram?: string;
    phone?: string;
  }) {
    this.email = email;
    this.facebook = facebook;
    this.instagram = instagram;
    this.phone = phone;
  }

  public toJSON(): any {
    const json = {
      email: this.email,
      fb: this.facebook,
      ig: this.instagram,
      phone: this.phone,
    };

    return filterObject(json, {
      filterNull: true,
      filterUndefined: true,
      filterEmptyString: true,
    });
  }
}
