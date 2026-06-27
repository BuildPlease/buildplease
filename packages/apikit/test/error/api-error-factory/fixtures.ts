import { defineErrors } from '@/error/api-error-codes';
import { ApiErrorFactory } from '@/error/api-error-factory';

export const AccountErrors = defineErrors({
  NOT_FOUND: {
    code: 'account_not_found',
    key: 'errors.account.not_found',
    statusCode: 404,
  },
});

export const TestErrorFactory = ApiErrorFactory.extend(
  defineErrors({
    Account: AccountErrors,
  }),
);
