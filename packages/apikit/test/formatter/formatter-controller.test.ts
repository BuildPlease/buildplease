import { describe, expect, it } from 'vitest';

import { FormatterControllerImpl } from '@/formatter/formatter-controller';

describe('FormatterController', () => {
  const controller = new FormatterControllerImpl();

  it('applies field transformations', () => {
    const result = controller
      .format({ name: ' value ', age: 30 })
      .apply({ name: (value: string) => value.trim() })
      .exec();

    expect(result).toEqual({ name: 'value', age: 30 });
  });

  it('filters undefined values deeply', () => {
    const result = controller
      .format({
        name: 'Project',
        nested: {
          value: undefined,
          active: true,
        },
        list: [undefined, 'a'],
      })
      .filter()
      .exec();

    expect(result).toEqual({
      name: 'Project',
      nested: {
        active: true,
      },
      list: ['a'],
    });
  });
});
