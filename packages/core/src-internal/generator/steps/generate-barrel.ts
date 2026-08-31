import path from 'node:path';

import {
  BUILDPLEASE_BUILD_MODULE,
  BUILDPLEASE_ENVIRONMENT_MODULE,
  BUILDPLEASE_INDEX_MODULE,
} from '@src-internal/buildplease-output';
import { createFile } from '@src-node/file';
import CodeBlockWriter from 'code-block-writer';

export function generateBarrel(outputPath: string): void {
  const writer = new CodeBlockWriter({
    newLine: '\n',
    indentNumberOfSpaces: 2,
    useTabs: false,
    useSingleQuote: true,
  });

  for (const moduleName of [BUILDPLEASE_BUILD_MODULE, BUILDPLEASE_ENVIRONMENT_MODULE]) {
    writer.write('export * from ').quote(`./${moduleName}.js`).write(';').newLine();
  }

  createFile(path.join(outputPath, `${BUILDPLEASE_INDEX_MODULE}.ts`), writer.toString());
}
