import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('WebKit runtime integration', () => {
  it('uses the browser WebKit entrypoint on the client', () => {
    const source = read('src/runtime/plugins/di.client.ts');

    expect(source).toContain("from '@buildplease/webkit'");
    expect(source).not.toContain('@buildplease/webkit/node');
    expect(source).not.toContain('@buildplease/webkit/internal');
  });

  it('uses the Node WebKit entrypoint on the server', () => {
    const server = read('src/runtime/plugins/di.server.ts');

    expect(server).toContain("from '@buildplease/webkit/node'");
    expect(server).not.toContain('@buildplease/webkit/internal');
  });

  it('passes app assemblies through the public runtime hook', () => {
    const integration = `${read('src/runtime/plugins/di.client.ts')}\n${read('src/runtime/plugins/di.server.ts')}`;
    const playground = read('playground/app/plugins/00.assembly.ts');

    expect(integration).toContain('assemblies: () => host.$webkitAssemblies?.() ?? []');
    expect(integration).not.toContain('coreAssembly');
    expect(integration).not.toContain('.assemble(');
    expect(playground).toContain('webkitAssemblies: () =>');
    expect(playground).not.toContain('.assemble(');
  });

  it('creates the Node runtime in the per-request SSR app plugin', () => {
    const server = read('src/runtime/plugins/di.server.ts');

    expect(server).toContain('const runtime = await runWebKit({');
    expect(server).toContain('assemblies: () => host.$webkitAssemblies?.() ?? []');
    expect(server).not.toContain('event.context');
  });
});
