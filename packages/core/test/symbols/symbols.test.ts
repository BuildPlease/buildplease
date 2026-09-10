import { defineSymbols, Symbols } from '@neutral/symbols';
import { describe, expect, it } from 'vitest';

describe('Symbols', () => {
  it('keeps the declared symbol tree readable and explicit', () => {
    const dateTime = Symbol.for('test.symbols.DI.Formatter.DateTime');
    const logger = Symbol.for('test.symbols.DI.Logging.Logger');
    const symbols = defineSymbols({
      DI: {
        Formatter: {
          DateTime: dateTime,
        },
        Logging: {
          Logger: logger,
        },
      },
    });

    expect(symbols.DI.Formatter.DateTime).toBe(dateTime);
    expect(symbols.DI.Logging.Logger).toBe(logger);
  });

  it('extends the symbol tree without mutating the parent or extension', () => {
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

  it('composes multiple symbol owners into one shared structural surface', () => {
    const configurationProvider = Symbol.for('Platform.Database.DI.Database.ConfigurationProvider');
    const provider = Symbol.for('Platform.PostgreSQL.DI.Database.Provider');

    const databaseSymbols = defineSymbols({
      DI: {
        Database: {
          ConfigurationProvider: configurationProvider,
        },
      },
    });
    const postgreSQLSymbols = defineSymbols({
      DI: {
        Database: {
          Provider: provider,
        },
      },
    });

    const backendSymbols = defineSymbols({}).extend(databaseSymbols).extend(postgreSQLSymbols);

    expect(backendSymbols.DI.Database.ConfigurationProvider).toBe(configurationProvider);
    expect(backendSymbols.DI.Database.Provider).toBe(provider);
  });

  it('deep-merges compatible branches', () => {
    const custom = Symbol.for('test.symbols.formatter.custom');
    const extended = Symbols.extend({
      DI: {
        Formatter: {
          Custom: custom,
        },
      },
    });

    expect(extended.DI.Formatter.DateTime).toBe(Symbols.DI.Formatter.DateTime);
    expect(extended.DI.Formatter.Unit).toBe(Symbols.DI.Formatter.Unit);
    expect(extended.DI.Formatter.Custom).toBe(custom);
  });

  it('accepts the same symbol identity at the same path', () => {
    const extended = Symbols.extend({
      DI: {
        Formatter: {
          DateTime: Symbols.DI.Formatter.DateTime,
        },
      },
    });

    expect(extended.DI.Formatter.DateTime).toBe(Symbols.DI.Formatter.DateTime);
  });

  it('rejects a different symbol identity at the same path', () => {
    expect(() =>
      Symbols.extend({
        DI: {
          Formatter: {
            DateTime: Symbol.for('test.symbols.formatter.date-time'),
          },
        },
      }),
    ).toThrow("Cannot extend symbols: conflicting identity at 'DI.Formatter.DateTime'.");
  });

  it('freezes the exported symbol tree', () => {
    expect(Object.isFrozen(Symbols)).toBe(true);
    expect(Object.isFrozen(Symbols.DI)).toBe(true);
    expect(Object.isFrozen(Symbols.DI.Formatter)).toBe(true);
  });
});
