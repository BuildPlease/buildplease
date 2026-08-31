import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

function readTypeScriptTree(path: string): string {
  const directory = resolve(root, path);

  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .map((entry) => readFileSync(resolve(entry.parentPath, entry.name), 'utf8'))
    .join('\n');
}

describe('WebKit integration ownership', () => {
  it('does not start or own WebKit from NuxtKit runtime source', () => {
    const source = readTypeScriptTree('src');

    expect(source).not.toContain('runWebKit(');
    expect(source).not.toContain('$webkitAssemblies');
    expect(source).not.toContain('WebKitAssemblyHost');
    expect(source).not.toContain('runtime/plugins/di.client');
    expect(source).not.toContain('runtime/plugins/di.server');
  });

  it('keeps platform-correct WebKit startup explicit in the consumer playground', () => {
    const clientPlugin = read('playground/app/plugins/00.webkit.client.ts');
    const serverPlugin = read('playground/app/plugins/00.webkit.server.ts');

    expect(clientPlugin).toContain("import { runWebKit } from '@buildplease/webkit';");
    expect(clientPlugin).not.toContain('@buildplease/webkit/node');
    expect(serverPlugin).toContain("import { runWebKit } from '@buildplease/webkit/node';");

    for (const plugin of [clientPlugin, serverPlugin]) {
      expect(plugin).toContain('const runtime = await runWebKit({');
      expect(plugin).toContain('new NetworkingAssembly(nuxt)');
      expect(plugin).toContain('scopeController: runtime.scope');
      expect(plugin).not.toContain('$webkitAssemblies');
    }
  });
});
