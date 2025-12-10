export type MongoDbQuery<T> = MongoDbFieldQuery<T> & MongoDbLogicalOperators<T>;

export type MongoDbFieldQuery<T> = {
  [K in keyof T]?: MongoDbFieldValue<T[K]>;
};

export type MongoDbFieldValue<V> =
  | V
  | MongoDbComparisonOperators<V>
  | (V extends object ? MongoDbFieldQuery<V> : never);

export type MongoDbLogicalOperators<T> = {
  $and?: MongoDbQuery<T>[];
  $or?: MongoDbQuery<T>[];
  $nor?: MongoDbQuery<T>[];
  $not?: MongoDbQuery<T>;
  $expr?: Record<string, any>; // MARK: - for computed expressions
};

export type MongoDbComparisonOperators<V> = {
  $eq?: V;
  $ne?: V;
  $gt?: V;
  $gte?: V;
  $lt?: V;
  $lte?: V;
  $in?: V[];
  $nin?: V[];
  $exists?: boolean;
  $regex?: V extends string ? string | RegExp : never;
};

export interface MongoDbUpdateOptions {
  /**
   * If true, creates a new document when no document matches the query.
   * Equivalent to `INSERT if not exists`.
   */
  upsert?: boolean;

  /**
   * If true, returns the updated document.
   * If false, returns the document as it was before the update.
   * Defaults to `true` in most framework layers.
   */
  new?: boolean;

  /**
   * If true, applies schema-level validations before applying the update.
   * Useful for ensuring data consistency.
   */
  runValidators?: boolean;

  /**
   * If true, replaces the entire document instead of performing a `$set` update.
   * Use this with caution — all unspecified fields will be removed.
   */
  overwrite?: boolean;

  /**
   * If true, returns a plain JavaScript object instead of a Mongoose document.
   * Improves performance if you don’t need Mongoose features like getters or methods.
   */
  lean?: boolean;

  /**
   * Selects specific fields to include (`1`) or exclude (`0`) in the returned document.
   * Example: `{ name: 1, email: 1 }` or `{ password: 0 }`
   */
  projection?: Record<string, 0 | 1>;

  /**
   * Controls how unknown fields are handled.
   * - `true`: strip unknown fields (default mongoose behavior)
   * - `false`: allow unknown fields
   * - `'throw'`: raise an error on unknown fields
   */
  strict?: boolean | 'throw';

  /**
   * When used with `upsert: true`, applies schema defaults
   * to newly inserted documents.
   */
  setDefaultsOnInsert?: boolean;

  /**
   * Overrides schema-level timestamps for this operation.
   * Set to `false` to skip updating `updatedAt` / `createdAt`.
   */
  timestamps?: boolean;

  /**
   * If true, returns the raw MongoDB result object
   * instead of the mapped document.
   */
  rawResult?: boolean;

  /**
   * Maximum time in milliseconds the server should spend
   * processing this update before aborting.
   */
  maxTimeMS?: number;
}
