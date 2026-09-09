import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { DashboardViewModel } from '~/feature/dashboard/view-model';
import { Symbols } from '~/symbols';

export class DashboardAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<DashboardViewModel>(Symbols.DI.Playground.Feature.Dashboard.ViewModel).to(DashboardViewModel);
  }
}
