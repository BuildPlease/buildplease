import { Symbols as ParentSymbols } from '@buildplease/core';
import { Symbols } from '@buildplease/webkit';
import { describe, expect, it } from 'vitest';

describe('Symbols', () => {
  it('re-exports the parent symbol tree when WebKit adds no symbols', () => {
    expect(Symbols).toBe(ParentSymbols);
  });
});
