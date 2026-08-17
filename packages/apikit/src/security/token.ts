import { ignoreError } from '@buildplease/core';

export class Token<T extends Record<string, unknown> = any> {
  private readonly _value: string;
  private readonly _payload: T;

  constructor(value: string, payload: T) {
    this._value = value;
    this._payload = payload;
  }

  get value(): string {
    return this._value;
  }

  get payload(): T {
    return this._payload;
  }

  getField<K extends keyof T>(key: K): T[K] | undefined {
    return ignoreError(() => this._payload[key]).orDefault(undefined);
  }
}
