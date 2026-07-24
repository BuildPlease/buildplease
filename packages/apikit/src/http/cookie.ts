import { type SerializeOptions, fastifyCookie } from '@fastify/cookie';

export type CookieOptions = SerializeOptions;

export interface CookieMutation {
  name?: string;
  value?: string;
  options?: CookieOptions;
}

export class Cookie {
  private _name: string;
  private _value: string;
  private _options: CookieOptions;

  public constructor(name: string, value: string, options: CookieOptions = {}) {
    this._name = name;
    this._value = value;
    this._options = { ...options };
  }

  public get name(): string {
    return this._name;
  }

  public get value(): string {
    return this._value;
  }

  public get options(): Readonly<CookieOptions> {
    return { ...this._options };
  }

  public mutate(mutation: CookieMutation): this {
    if (mutation.name !== undefined) {
      this._name = mutation.name;
    }

    if (mutation.value !== undefined) {
      this._value = mutation.value;
    }

    if (mutation.options !== undefined) {
      this._options = {
        ...this._options,
        ...mutation.options,
      };
    }

    return this;
  }

  public serialize(): string {
    return fastifyCookie.serialize(this._name, this._value, this._options);
  }

  public toString(): string {
    return this.serialize();
  }
}
