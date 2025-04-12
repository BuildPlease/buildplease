import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { HttpClient } from '@/networking';

export class NetworkingAssembly implements Assembly {
  public assemble(container: Container): void {
    container.bind(HttpClient).toSelf();
  }
}
