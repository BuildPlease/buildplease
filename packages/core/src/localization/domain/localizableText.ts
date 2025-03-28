import type { JSONSerializable } from '@/utils';

export class LocalizableText implements JSONSerializable {
  public values: { [lang: string]: string };

  constructor(LocalizableTexts: { [lang: string]: string }) {
    this.values = LocalizableTexts;
  }

  public getLocalized(lang: string): string | null {
    return this.values[lang] || null;
  }

  public toJSON(): any {
    return this.values;
  }
}
