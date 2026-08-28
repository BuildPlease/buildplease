import path from 'node:path';

import { type BuildMetadata, type PackageJSONModel, createFile, loadPackageJSON } from '@buildplease/core/node';
import { v7 as uuidV7 } from 'uuid';

import type { GeneratorOptions } from '../generator-options';

export async function generateBuildMetadata(options: GeneratorOptions): Promise<string[]> {
  const pkg = loadPackageJSON(path.resolve(process.cwd(), 'package.json'));
  const buildMetadata = makeBuildMetadata(pkg);
  const writer = new options.writer();

  writer.writeLine(`import type { BuildMetadata as BuildMetadataContract } from '@buildplease/apikit';`);
  writer.blankLine();
  writer.writeLine('export const BuildMetadata = {');
  writer.indent(() => {
    writer.writeLine('name: {');
    writer.indent(() => {
      writer.write('original: ').quote(buildMetadata.name.original).write(',').newLine();
      writer.write('base: ').quote(buildMetadata.name.base).write(',').newLine();
    });
    writer.writeLine('},');
    writer.write('version: ').quote(buildMetadata.version).write(',').newLine();
    writer.write('id: ').quote(buildMetadata.id).write(',').newLine();
    writer.write('createdAt: ').quote(buildMetadata.createdAt).write(',').newLine();
  });
  writer.writeLine('} as const satisfies BuildMetadataContract;');

  const moduleName = 'build-metadata';
  createFile(path.join(options.outputPath, `${moduleName}.ts`), writer.toString());

  return [moduleName];
}

export function makeBuildMetadata(pkg: Pick<PackageJSONModel, 'name' | 'version'>): BuildMetadata {
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
