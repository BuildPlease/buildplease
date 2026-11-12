import { Symbols as ParentSymbols } from '@buildplease/core';
import { Symbols } from '@buildplease/webkit';
import { describe, expect, it } from 'vitest';

describe('Symbols', () => {
  it('inherits the Core symbol tree when WebKit adds no symbols', () => {
    expect(Symbols.DI.Formatter.DateTime).toBe(ParentSymbols.DI.Formatter.DateTime);
    expect(Symbols.DI.Formatter.Unit).toBe(ParentSymbols.DI.Formatter.Unit);
    expect(Symbols.DI.Logging.Logger).toBe(ParentSymbols.DI.Logging.Logger);
  });
});
