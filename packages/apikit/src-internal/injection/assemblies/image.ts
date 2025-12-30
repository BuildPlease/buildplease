import type { Assembly, AssemblyContainer } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '@/di';
import { type ImageNormalizationController, ImageNormalizationControllerImpl } from '@/image';

export class ImageAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<ImageNormalizationController>(ApiKitSymbols.DI.Image.NormalizationController)
      .to(ImageNormalizationControllerImpl);
  }
}
