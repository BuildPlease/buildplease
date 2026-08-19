import { execFile as execFileCallback, spawn } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

const root = process.cwd();
const summaryPath = path.resolve(root, 'pnpm-publish-summary.json');

type PackageIdentity = {
  name: string;
  version: string;
};

type FailedPackage = PackageIdentity & {
  error: string;
};

type PackageManifest = {
  name?: unknown;
  version?: unknown;
  private?: unknown;
};

type PnpmPublishSummary = {
  publishedPackages: PackageIdentity[];
};

type PublishSummary = {
  publishedPackages: PackageIdentity[];
  failedPackages: FailedPackage[];
};

const summary: PublishSummary = {
  publishedPackages: [],
  failedPackages: [],
};

try {
  await writeSummary();

  const packages = await loadWorkspacePackages();

  for (const pkg of packages) {
    await publishPackage(pkg);
    await writeSummary();
  }

  printSummary();

  if (summary.failedPackages.length > 0) process.exitCode = 1;
} catch (error) {
  const message = getErrorMessage(error);

  console.error(`::error title=Release failed::${message.replaceAll('\n', ' ')}`);
  console.error(`Release failed: ${message}`);

  process.exitCode = 1;
}

async function loadWorkspacePackages(): Promise<PackageIdentity[]> {
  const output = await runCapture('pnpm', ['ls', '-r', '--depth', '-1', '--parseable']);
  const directories = output
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);

  const packages: PackageIdentity[] = [];

  for (const directory of directories) {
    const packagePath = path.resolve(directory);
    if (packagePath === root) continue;

    const manifest = await readJson<PackageManifest>(path.join(packagePath, 'package.json'));
    if (manifest.private === true) continue;

    if (typeof manifest.name !== 'string' || typeof manifest.version !== 'string') {
      throw new Error(`Invalid package manifest: ${path.relative(root, packagePath)}`);
    }

    packages.push({
      name: manifest.name,
      version: manifest.version,
    });
  }

  return packages;
}

async function publishPackage(pkg: PackageIdentity): Promise<void> {
  const identity = `${pkg.name}@${pkg.version}`;

  console.log(`\nPublishing ${identity}...\n`);

  await rm(summaryPath, { force: true });

  try {
    await run('pnpm', ['--filter', pkg.name, 'publish', '--no-git-checks', '--report-summary']);

    const pnpmSummary = await readPnpmSummary();
    const published = pnpmSummary.publishedPackages.some(
      (item) => item.name === pkg.name && item.version === pkg.version,
    );

    if (!published) {
      console.log(`− Skipped ${identity} (already published)`);
      return;
    }

    summary.publishedPackages.push(pkg);

    console.log(`✓ Published ${identity}`);
  } catch (error) {
    const message = getErrorMessage(error);

    summary.failedPackages.push({
      ...pkg,
      error: message,
    });

    console.error(`::error title=Publish failed::${identity} failed to publish.`);
  }
}

async function readPnpmSummary(): Promise<PnpmPublishSummary> {
  const summary = await readJson<{ publishedPackages?: unknown }>(summaryPath);

  if (!Array.isArray(summary.publishedPackages)) {
    throw new Error('Invalid pnpm publish summary.');
  }

  const publishedPackages = summary.publishedPackages.map((pkg) => {
    if (!pkg || typeof pkg !== 'object') {
      throw new Error('pnpm publish summary contains an invalid package.');
    }

    const { name, version } = pkg as Partial<PackageIdentity>;

    if (typeof name !== 'string' || typeof version !== 'string') {
      throw new Error('pnpm publish summary contains an invalid package.');
    }

    return { name: name, version: version };
  });

  return { publishedPackages: publishedPackages };
}

async function writeSummary(): Promise<void> {
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}

function printSummary(): void {
  console.log('\nRelease summary:\n');

  if (summary.publishedPackages.length === 0 && summary.failedPackages.length === 0) {
    console.log('No packages were published.');
    return;
  }

  for (const pkg of summary.publishedPackages) console.log(`✓ ${pkg.name}@${pkg.version}`);
  for (const pkg of summary.failedPackages) console.log(`✗ ${pkg.name}@${pkg.version}`);

  if (summary.failedPackages.length > 0) {
    console.error(`\n${summary.failedPackages.length} package publish(es) failed.`);
  }
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

      reject(new Error(signal ? `${command} terminated by signal ${signal}.` : `${command} exited with code ${code}.`));
    });
  });
}

async function runCapture(command: string, args: string[]): Promise<string> {
  const { stdout } = await execFile(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });

  return stdout.trim();
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, 'utf8')) as T;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
