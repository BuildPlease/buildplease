import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { DashboardViewModel } from '~/feature/dashboard/view-model';
import { AppSymbols } from '~/symbols';

export class DashboardAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<DashboardViewModel>(AppSymbols.DI.Feature.Dashboard.ViewModel).to(DashboardViewModel);
  }
}
