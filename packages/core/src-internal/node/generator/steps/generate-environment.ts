import path from 'node:path';

import { BUILDPLEASE_ENVIRONMENT_MODULE } from '@internal/node/buildplease-output';
import type { EnvironmentRegistry } from '@node/environment-configuration';
import { createFile } from '@node/file';
import CodeBlockWriter from 'code-block-writer';

export function generateEnvironment(environments: EnvironmentRegistry, outputPath: string): void {
  const entries = Object.entries(environments);
  const writer = new CodeBlockWriter({
    newLine: '\n',
    indentNumberOfSpaces: 2,
    useTabs: false,
    useSingleQuote: true,
  });

  writer.writeLine('export enum Environment {');
  writer.indent(() => {
    for (const [name] of entries) {
      writer.write(formatPropertyName(name)).write(' = ').quote(name).write(',').newLine();
    }
  });
  writer.writeLine('}');
  writer.blankLine();
  writer.writeLine('export const Environments = {');
  writer.indent(() => {
    for (const [name, environment] of entries) {
      writer.write(formatPropertyName(name)).write(': {').newLine();
      writer.indent(() => {
        writer.write('name: ').write(formatEnvironmentReference(name)).write(',').newLine();
        const alias = environment.alias?.trim();
        if (alias) writer.write('alias: ').quote(alias).write(',').newLine();
      });
      writer.writeLine('},');
    }
  });
  writer.writeLine('} as const;');

  createFile(path.join(outputPath, `${BUILDPLEASE_ENVIRONMENT_MODULE}.ts`), writer.toString());
}

function formatPropertyName(name: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(name) ? name : JSON.stringify(name);
}

function formatEnvironmentReference(name: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(name) ? `Environment.${name}` : `Environment[${JSON.stringify(name)}]`;
}
