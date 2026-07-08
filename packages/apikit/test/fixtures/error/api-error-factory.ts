import { ApiErrorFactory, defineErrors } from '@/error';

export const AccountErrors = defineErrors({
  NOT_FOUND: {
    code: 'account_not_found',
    message: 'errors.account.not_found',
    statusCode: 404,
  },
});

export const TestErrorFactory = ApiErrorFactory.extend(
  defineErrors({
    Account: AccountErrors,
  }),
);
