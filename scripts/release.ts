/// <reference types="node" />

import { spawn } from 'node:child_process';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const summaryPath = path.resolve(root, 'pnpm-publish-summary.json');
const summaryTempPath = `${summaryPath}.tmp`;

type PublishedPackage = {
  name: string;
  version: string;
};

type PublishSummary = {
  publishedPackages: PublishedPackage[];
};

try {
  const candidates = await getPublishCandidates();
  const published: PublishedPackage[] = [];
  const failed: PublishedPackage[] = [];

  if (candidates.length === 0) {
    console.log('No packages to publish.');
  }

  for (const pkg of candidates) {
    console.log(`\nPublishing ${pkg.name}@${pkg.version}...\n`);

    try {
      await run('pnpm', ['--filter', pkg.name, 'publish', '--no-git-checks']);

      published.push(pkg);
      await writeSummary(published);

      console.log(`\n✓ Published ${pkg.name}@${pkg.version}`);
    } catch {
      failed.push(pkg);

      console.error(`\n::error title=Publish failed::${pkg.name}@${pkg.version} failed to publish.`);
    }
  }

  console.log('\nPublish summary:');

  for (const pkg of published) {
    console.log(`✓ ${pkg.name}@${pkg.version}`);
  }

  for (const pkg of failed) {
    console.log(`✗ ${pkg.name}@${pkg.version}`);
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} of ${candidates.length} package publishes failed.`);

    process.exitCode = 1;
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`::error title=Release failed::${message.replaceAll('\n', ' ')}`);
  console.error(`Release failed: ${message}`);

  process.exitCode = 1;
}

async function getPublishCandidates(): Promise<PublishedPackage[]> {
  // Always start with a safe empty summary so post-release never sees stale data.
  await writeSummary([]);

  try {
    await run('pnpm', ['-r', 'publish', '--dry-run', '--no-git-checks', '--report-summary']);

    const summary = await readSummary();

    return summary.publishedPackages;
  } finally {
    // The dry-run summary contains candidates, not packages actually published.
    // Reset it before the first real publish.
    await writeSummary([]);
  }
}

async function readSummary(): Promise<PublishSummary> {
  const value: unknown = JSON.parse(await readFile(summaryPath, 'utf8'));

  if (!value || typeof value !== 'object' || !Array.isArray((value as PublishSummary).publishedPackages)) {
    throw new Error('pnpm-publish-summary.json is missing or invalid.');
  }

  const publishedPackages = (value as PublishSummary).publishedPackages.map((pkg) => {
    if (!pkg || typeof pkg.name !== 'string' || typeof pkg.version !== 'string') {
      throw new Error('pnpm-publish-summary.json contains an invalid package.');
    }

    return {
      name: pkg.name,
      version: pkg.version,
    };
  });

  return { publishedPackages: publishedPackages };
}

async function writeSummary(publishedPackages: PublishedPackage[]): Promise<void> {
  const summary: PublishSummary = { publishedPackages: publishedPackages };

  await writeFile(summaryTempPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  await rename(summaryTempPath, summaryPath);
}

async function run(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    });

    child.on('error', reject);

    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const reason = signal ? `terminated by signal ${signal}` : `exited with code ${code}`;

      reject(new Error(`${command} ${args.join(' ')} ${reason}.`));
    });
  });
}
