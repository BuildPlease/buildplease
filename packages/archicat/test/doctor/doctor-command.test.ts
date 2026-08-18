import { afterAll, describe, expect, test } from 'vitest';

import { cleanupConsumerProjects, createConsumerProject, createModule } from '#test/fixtures/consumer-project';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

describe('doctor command', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should pass before generate when source setup is clean', async () => {
    const root = createConsumerProject('doctor-before-generate');

    createModule(root, { name: 'account' });

    const result = await runArchicatCommand(root, 'doctor');

    expect(result.status, result.stderr).toBe(0);
  });

  test('should pass after generate when setup is clean', async () => {
    const root = createConsumerProject('doctor-after-generate');

    createModule(root, { name: 'account' });

    expect((await runArchicatCommand(root, 'generate')).status).toBe(0);

    const result = await runArchicatCommand(root, 'doctor');

    expect(result.status, result.stderr).toBe(0);
  });
});
