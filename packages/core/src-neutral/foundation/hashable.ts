import type { Identity } from './identity';

export interface Hashable {
  hash(): Identity;
}
