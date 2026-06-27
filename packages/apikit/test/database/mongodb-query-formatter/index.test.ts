import { describe, expect, it } from 'vitest';

import { MongoDbQueryFormatterImpl } from '@/database/mongodb-query-formatter';

interface UserQuery {
  profile: {
    name: string;
    age: number;
  };
  status: string;
}

describe('MongoDbQueryFormatter', () => {
  const formatter = new MongoDbQueryFormatterImpl();

  it('flattens nested fields into dot notation', () => {
    expect(
      formatter.format<UserQuery>({
        profile: {
          name: 'Simon',
          age: { $gte: 18 },
        },
        status: undefined,
      }),
    ).toEqual({
      'profile.name': 'Simon',
      'profile.age': { $gte: 18 },
    });
  });

  it('preserves logical operators', () => {
    expect(
      formatter.format<UserQuery>({
        $or: [{ profile: { name: 'Simon' } }, { status: 'active' }],
      }),
    ).toEqual({
      $or: [{ 'profile.name': 'Simon' }, { status: 'active' }],
    });
  });
});
