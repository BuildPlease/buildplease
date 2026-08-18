import { type SpawnSyncReturns, spawnSync } from 'node:child_process';

import { cliPath } from '#test/fixtures/paths';

// MARK: - CLI fixture

export function runArchicatCli(cwd: string, command: string, args: readonly string[] = []): SpawnSyncReturns<string> {
  return spawnSync(process.execPath, [cliPath, command, ...args], {
    cwd: cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
    },
  });
}
