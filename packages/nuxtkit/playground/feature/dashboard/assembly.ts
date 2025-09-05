import type { Container } from 'inversify';

import { Symbols } from '@di/symbols';

import { DashboardViewModel } from '@feature/dashboard/view-model';
import {
  type UnauthorizedOperation,
  UnauthorizedResource,
  UnauthorizedEndpoint,
} from '@feature/dashboard/unauthorized-operation';

export class DashboardAssembly {
  public assemble(container: Container): void {
    container.bind<DashboardViewModel>(Symbols.DI.Feature.Dashboard.ViewModel).to(DashboardViewModel);

    container.bind(UnauthorizedEndpoint).toSelf();
    container.bind<UnauthorizedOperation>(Symbols.DI.Operation.Unauthorized).to(UnauthorizedResource);
  }
}
