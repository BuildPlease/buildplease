import { describe, expect, it } from 'vitest';

import { I18nFactory } from '@/i18n/i18n-factory';

describe('I18nFactory', () => {
  it('returns override message without provider lookup', () => {
    const message = I18nFactory.make('messages.account.email_code_sent', {
      overrideMessage: 'Email code sent.',
    });

    expect(message).toBe('Email code sent.');
  });
});
