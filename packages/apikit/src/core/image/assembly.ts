import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type ImageNormalizationController, ImageNormalizationControllerImpl } from '#/image';

export class ImageAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<ImageNormalizationController>(ApiKitSymbols.DI.Image.NormalizationController)
      .to(ImageNormalizationControllerImpl);
  }
}
