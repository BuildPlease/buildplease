import type { Assembly, AssemblyContainer } from '@buildplease/webkit';

import { Symbols } from '~/di/symbols';
import { DashboardViewModel } from '~/feature/dashboard/view-model';

export class DashboardAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<DashboardViewModel>(Symbols.DI.Feature.Dashboard.ViewModel).to(DashboardViewModel);
  }
}
