import { injectable } from 'inversify';

import type { MongoDbQuery } from '#/database';

export interface MongoDbQueryFormatter {
  format<T>(query: MongoDbQuery<T>): Record<string, any>;
}

@injectable()
export class MongoDbQueryControllerImpl implements MongoDbQueryFormatter {
  format<T>(query: MongoDbQuery<T>): Record<string, any> {
    return this.flatten(query);
  }

  private flatten(input: Record<string, any>): Record<string, any> {
    return this.flattenRecursive(input, '');
  }

  private flattenRecursive(input: Record<string, any>, path: string): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(input)) {
      if (!Object.prototype.hasOwnProperty.call(input, key)) continue;

      if (this.isOperator(key)) {
        result[key] = this.processOperator(key, value);
        continue;
      }

      const fullKey = path ? `${path}.${key}` : key;

      if (this.isObject(value)) {
        if (this.containsOperator(value)) {
          result[fullKey] = { ...value };
        } else {
          Object.assign(result, this.flattenRecursive(value, fullKey));
        }
      } else {
        result[fullKey] = value;
      }
    }

    return result;
  }

  private isOperator(key: string): boolean {
    return key.startsWith('$');
  }

  private containsOperator(obj: Record<string, any>): boolean {
    return Object.keys(obj).some((key) => this.isOperator(key));
  }

  private isObject(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
  }

  private processOperator(key: string, value: any): any {
    if (key === '$expr') return value;

    if (Array.isArray(value)) {
      return value.map((v) => this.flattenRecursive(v, ''));
    }

    if (this.isObject(value)) {
      return this.flattenRecursive(value, '');
    }

    return value;
  }
}
