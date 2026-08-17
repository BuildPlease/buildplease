import { createDirectory, removePath, resolvePath } from '@buildplease/core/node';
import CodeBlockWriter from 'code-block-writer';

import type { GeneratorConfig } from './configuration';

export class GeneratorWriter extends CodeBlockWriter {
  public constructor() {
    super({
      newLine: '\n',
      indentNumberOfSpaces: 2,
      useTabs: false,
      useSingleQuote: true,
    });
  }
}

export interface GeneratorOptions {
  readonly outputPath: string;
  readonly writer: typeof GeneratorWriter;
}

export function makeGeneratorOptions(config: GeneratorConfig): GeneratorOptions {
  const outputPath = resolvePath(process.cwd(), config.build.outDir);

  if (outputPath === process.cwd()) throw new Error('Cannot use root directory as output path.');

  return {
    outputPath: outputPath,
    writer: GeneratorWriter,
  };
}

export function prepareGeneratorOutput(options: GeneratorOptions): void {
  removePath(options.outputPath, { recursive: true, force: true });
  createDirectory(options.outputPath);
}
