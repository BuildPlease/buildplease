import path from 'node:path';

import type { Build } from '@buildplease/core';
import { createFile } from '@buildplease/core/node';
import CodeBlockWriter from 'code-block-writer';

import { APIKIT_BUILD_MODULE } from '../apikit-output';

export function generateBuild(build: Build, outputPath: string): void {
  const writer = new CodeBlockWriter({
    newLine: '\n',
    indentNumberOfSpaces: 2,
    useTabs: false,
    useSingleQuote: true,
  });

  writer.writeLine(`import type { Build as BuildContract } from '@buildplease/apikit';`);
  writer.blankLine();
  writer.writeLine('export const Build = {');
  writer.indent(() => {
    writer.writeLine('name: {');
    writer.indent(() => {
      writer.write('original: ').quote(build.name.original).write(',').newLine();
      writer.write('base: ').quote(build.name.base).write(',').newLine();
    });
    writer.writeLine('},');
    writer.write('version: ').quote(build.version).write(',').newLine();
  });
  writer.writeLine('} as const satisfies BuildContract;');

  createFile(path.join(outputPath, `${APIKIT_BUILD_MODULE}.ts`), writer.toString());
}
