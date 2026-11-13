import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type ImageNormalizationController, ImageNormalizationControllerImpl } from '@/image';
import { Symbols } from '@/symbols';

export class ImageAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<ImageNormalizationController>(Symbols.DI.Image.NormalizationController)
      .to(ImageNormalizationControllerImpl);
  }
}
