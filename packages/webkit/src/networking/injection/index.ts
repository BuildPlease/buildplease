import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { HttpClient } from '@/networking/resource/httpClient';

export class NetworkingAssembly implements Assembly {
  assemble(container: Container): void {
    container.bind(HttpClient).toSelf();
  }
}
