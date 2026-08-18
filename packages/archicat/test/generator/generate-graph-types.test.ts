import path from 'node:path';

import { afterAll, describe, expect, test } from 'vitest';

import {
  cleanupConsumerProjects,
  createConsumerProject,
  createLibrary,
  createModule,
} from '#test/fixtures/consumer-project';
import { readText } from '#test/fixtures/files';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

describe('graph type generation', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should generate project graph dependency types', async () => {
    const root = createConsumerProject('generate-graph-types', {
      config: {
        librariesInclude: ['./src/libraries'],
      },
    });

    createLibrary(root, { name: 'backend' });
    createModule(root, { name: 'account' });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status, result.stderr).toBe(0);

    const graphTypes = readText(path.join(root, '.archicat/types/graph.d.ts'));

    expect(graphTypes).toContain("import '@buildplease/archicat';");
    expect(graphTypes).toContain("declare module '@buildplease/archicat'");
    expect(graphTypes).not.toContain("declare module 'archicat'");
    expect(graphTypes).toMatch(/interface ArchicatModuleApiDependencies/);
    expect(graphTypes).toMatch(/interface ArchicatAppDependencies/);
    expect(graphTypes).toMatch(/'module\.account\.api': true/);
    expect(graphTypes).toMatch(/'module\.account\.impl': true/);
    expect(graphTypes).toMatch(/'library\.backend\.api': true/);

    const moduleApiDependencies = getInterfaceBody(graphTypes, 'ArchicatModuleApiDependencies');
    const moduleImplDependencies = getInterfaceBody(graphTypes, 'ArchicatModuleImplDependencies');

    expect(moduleApiDependencies).toContain("'module.account.api': true;");
    expect(moduleApiDependencies).not.toContain("'module.account.impl': true;");
    expect(moduleImplDependencies).toContain("'module.account.impl': true;");
  });
});

function getInterfaceBody(content: string, name: string): string {
  const match = new RegExp(`interface ${name} \\{([\\s\\S]*?)\\n  \\}`).exec(content);

  if (!match) {
    throw new Error(`Missing generated interface: ${name}`);
  }

  return match[1] as string;
}
