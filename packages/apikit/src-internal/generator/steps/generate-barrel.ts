import path from 'node:path';

import { createFile } from '@buildplease/core/node';
import CodeBlockWriter from 'code-block-writer';

import { APIKIT_BUILD_MODULE, APIKIT_ENVIRONMENT_MODULE, APIKIT_INDEX_MODULE } from '../apikit-output';

export function generateBarrel(outputPath: string): void {
  const writer = new CodeBlockWriter({
    newLine: '\n',
    indentNumberOfSpaces: 2,
    useTabs: false,
    useSingleQuote: true,
  });

  for (const moduleName of [APIKIT_BUILD_MODULE, APIKIT_ENVIRONMENT_MODULE]) {
    writer.write('export * from ').quote(`./${moduleName}.js`).write(';').newLine();
  }

  createFile(path.join(outputPath, `${APIKIT_INDEX_MODULE}.ts`), writer.toString());
}
