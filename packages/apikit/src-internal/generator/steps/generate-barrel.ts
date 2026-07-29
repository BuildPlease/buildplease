import path from 'node:path';

import { createFile } from '@meawkit/core/node';

import type { GeneratorOptions } from '../generator-options';

export async function generateBarrel(options: GeneratorOptions, generatedModules: string[]): Promise<void> {
  const writer = new options.writer();

  for (const moduleName of generatedModules) {
    writer.write('export * from ').quote(`./${moduleName}.js`).write(';').newLine();
  }

  createFile(path.join(options.outputPath, 'index.ts'), writer.toString());
}
