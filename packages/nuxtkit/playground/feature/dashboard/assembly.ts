import type { Assembly, AssemblyContainer } from '@meawkit/webkit';

import { Symbols } from '@di/symbols';

import { DashboardViewModel } from '@feature/dashboard/view-model';
import { type TestOperation, TestResource, TestEndpoint } from '@feature/dashboard/test-operation';
import {
  type UnauthorizedOperation,
  UnauthorizedResource,
  UnauthorizedEndpoint,
} from '@feature/dashboard/unauthorized-operation';

export class DashboardAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<DashboardViewModel>(Symbols.DI.Feature.Dashboard.ViewModel).to(DashboardViewModel);

    container.bind(TestEndpoint).toSelf();
    container.bind<TestOperation>(Symbols.DI.Operation.Test).to(TestResource);

    container.bind(UnauthorizedEndpoint).toSelf();
    container.bind<UnauthorizedOperation>(Symbols.DI.Operation.Unauthorized).to(UnauthorizedResource);
  }
}
