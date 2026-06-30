import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface TemporaryConfigProject {
  readonly rootDir: string;
  readonly writeConfig: (name: string, content: string) => Promise<void>;
  readonly cleanup: () => Promise<void>;
}

export async function makeTemporaryConfigProject(): Promise<TemporaryConfigProject> {
  const rootDir = await mkdtemp(join(tmpdir(), 'apikit-config-'));

  return {
    rootDir,

    writeConfig(name, content) {
      return writeFile(join(rootDir, name), content, 'utf8');
    },

    cleanup() {
      return rm(rootDir, { recursive: true, force: true });
    },
  };
}
