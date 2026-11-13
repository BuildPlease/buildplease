import { Symbols as ParentSymbols } from '@buildplease/core';
import { describe, expect, it } from 'vitest';

import { Symbols } from '@/symbols';

describe('Symbols', () => {
  it('preserves inherited Core symbol identity', () => {
    expect(Symbols.DI.Formatter.DateTime).toBe(ParentSymbols.DI.Formatter.DateTime);
    expect(Symbols.DI.Formatter.Unit).toBe(ParentSymbols.DI.Formatter.Unit);
    expect(Symbols.DI.Logging.Logger).toBe(ParentSymbols.DI.Logging.Logger);
  });

  it('adds ApiKit symbols to the inherited tree', () => {
    expect(Symbols.DI.Configuration.Controller).toBeTypeOf('symbol');
    expect(Symbols.DI.I18n.Controller).toBeTypeOf('symbol');
    expect(Symbols.DI.Server.Controller).toBeTypeOf('symbol');
  });
});
