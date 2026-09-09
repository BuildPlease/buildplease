import { Symbols } from '@neutral/symbols';
import { describe, expect, it } from 'vitest';

describe('Symbols', () => {
  it('extends the symbol tree without mutating the parent', () => {
    const service = Symbol.for('test.symbols.app.service');
    const replacement = Symbol.for('test.symbols.app.replacement');
    const extension = {
      DI: {
        TestApp: {
          Service: service,
        },
      },
    };
    const extended = Symbols.extend(extension);

    extension.DI.TestApp.Service = replacement;

    expect(extended.DI.Formatter.DateTime).toBe(Symbols.DI.Formatter.DateTime);
    expect(extended.DI.TestApp.Service).toBe(service);
    expect('TestApp' in Symbols.DI).toBe(false);
  });

  it('deep-merges branches and lets the extension override leaves', () => {
    const replacement = Symbol.for('test.symbols.formatter.date-time');
    const custom = Symbol.for('test.symbols.formatter.custom');
    const extended = Symbols.extend({
      DI: {
        Formatter: {
          Custom: custom,
          DateTime: replacement,
        },
      },
    });

    expect(extended.DI.Formatter.DateTime).toBe(replacement);
    expect(extended.DI.Formatter.Unit).toBe(Symbols.DI.Formatter.Unit);
    expect(extended.DI.Formatter.Custom).toBe(custom);
    expect(Symbols.DI.Formatter.DateTime).not.toBe(replacement);
  });

  it('freezes the exported symbol tree', () => {
    expect(Object.isFrozen(Symbols)).toBe(true);
    expect(Object.isFrozen(Symbols.DI)).toBe(true);
    expect(Object.isFrozen(Symbols.DI.Formatter)).toBe(true);
  });
});
