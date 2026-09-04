import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type ImageNormalizationController, ImageNormalizationControllerImpl } from '@/image';
import { ApiKitSymbols } from '@/symbols';

export class ImageAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<ImageNormalizationController>(ApiKitSymbols.DI.Image.NormalizationController)
      .to(ImageNormalizationControllerImpl);
  }
}
