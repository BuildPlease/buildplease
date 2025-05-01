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
