import type { Assembly, AssemblyContainer } from '@buildplease/core';

export class WebKitAssembly implements Assembly {
  public assemble(_container: AssemblyContainer): void {}
}
