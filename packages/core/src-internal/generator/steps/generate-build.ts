import path from 'node:path';

import { BUILDPLEASE_BUILD_MODULE } from '@src-internal/buildplease-output';
import { createFile } from '@src-node/file';
import type { PackageJSONModel } from '@src-node/package-json';
import CodeBlockWriter from 'code-block-writer';
import { v7 as uuidV7 } from 'uuid';

import type { Build } from '@/build';

export function generateBuild(build: Build, outputPath: string): void {
  const writer = new CodeBlockWriter({
    newLine: '\n',
    indentNumberOfSpaces: 2,
    useTabs: false,
    useSingleQuote: true,
  });

  writer.writeLine(`import type { Build as BuildContract } from '@buildplease/core';`);
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
    writer.write('id: ').quote(build.id).write(',').newLine();
    writer.write('createdAt: ').quote(build.createdAt).write(',').newLine();
  });
  writer.writeLine('} as const satisfies BuildContract;');

  createFile(path.join(outputPath, `${BUILDPLEASE_BUILD_MODULE}.ts`), writer.toString());
}

export function makeBuild(pkg: Pick<PackageJSONModel, 'name' | 'version'>): Build {
  return {
    name: {
      original: pkg.name.original,
      base: pkg.name.base,
    },
    version: pkg.version,
    id: uuidV7(),
    createdAt: new Date().toISOString(),
  };
}
