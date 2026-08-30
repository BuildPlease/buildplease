import path from 'node:path';

import { type EnvironmentRegistry, createFile } from '@buildplease/core/node';

import type { GeneratorOptions } from '../generator-options';

export async function generateEnvironment(
  environments: EnvironmentRegistry,
  options: GeneratorOptions,
): Promise<string[]> {
  const entries = Object.entries(environments);
  const writer = new options.writer();

  writer.writeLine('export enum Environment {');
  writer.indent(() => {
    for (const [name] of entries) {
      writer.write(`${name} = `).quote(name).write(',').newLine();
    }
  });
  writer.writeLine('}');
  writer.blankLine();
  writer.writeLine('export const Environments = {');
  writer.indent(() => {
    for (const [name, environment] of entries) {
      writer.writeLine(`${name}: {`);
      writer.indent(() => {
        writer.writeLine(`name: Environment.${name},`);
        if (environment.file) writer.write('file: ').quote(environment.file).write(',').newLine();
        if (environment.fileDir) writer.write('fileDir: ').quote(environment.fileDir).write(',').newLine();
      });
      writer.writeLine('},');
    }
  });
  writer.writeLine('} as const;');
  writer.blankLine();
  writer.writeLine('export type EnvironmentType = keyof typeof Environments;');

  const moduleName = 'environment';
  createFile(path.join(options.outputPath, `${moduleName}.ts`), writer.toString());

  return [moduleName];
}
