import { execFile as execFileCallback, spawn } from 'node:child_process';
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

const root = process.cwd();
const summaryPath = path.resolve(root, 'pnpm-publish-summary.json');

const commitParser = 'conventional-commits-parser@7.1.2';
const commitSeparator = '\x1e';
const headerPattern = String.raw`^(\w*)(?:\(([\w$@.\-*/ ]*)\))?!?: (.*)$`;

const sections = {
  breaking: 'Breaking Changes',
  feat: 'Features',
  fix: 'Fixes',
  perf: 'Performance',
  refactor: 'Refactoring',
} as const;

type PackageIdentity = {
  name: string;
  version: string;
};

type Release = PackageIdentity & {
  tag: string;
  notes: string;
};

type PackageManifest = {
  name?: unknown;
  version?: unknown;
};

type ParsedCommit = {
  type?: string | null;
  scope?: string | null;
  subject?: string | null;
  header?: string | null;
  notes?: Array<{
    text?: string | null;
  }>;
};

try {
  const publishedPackages = await loadPublishedPackages();
  const releases = await prepareReleases(publishedPackages);

  await pushGitTags(releases);
  await createGitHubReleases(releases);
  await writeSummary(releases);
} catch (error) {
  const message = getErrorMessage(error);

  console.error(`::error title=Post release failed::${message.replaceAll('\n', ' ')}`);
  console.error(`Post-release failed: ${message}`);

  process.exitCode = 1;
}

async function loadPublishedPackages(): Promise<PackageIdentity[]> {
  const summary = await readJson<{ publishedPackages?: unknown }>(summaryPath);

  if (!Array.isArray(summary.publishedPackages)) {
    throw new Error('pnpm-publish-summary.json is missing publishedPackages.');
  }

  return summary.publishedPackages.map((pkg) => {
    if (!pkg || typeof pkg !== 'object') {
      throw new Error('pnpm-publish-summary.json contains an invalid published package.');
    }

    const { name, version } = pkg as Partial<PackageIdentity>;

    if (typeof name !== 'string' || typeof version !== 'string') {
      throw new Error('pnpm-publish-summary.json contains an invalid published package.');
    }

    return { name: name, version: version };
  });
}

async function prepareReleases(publishedPackages: PackageIdentity[]): Promise<Release[]> {
  return Promise.all(publishedPackages.map(prepareRelease));
}

async function prepareRelease(pkg: PackageIdentity): Promise<Release> {
  const shortName = pkg.name.split('/').at(-1);
  if (!shortName) throw new Error(`Invalid package name: ${pkg.name}`);

  const packagePath = `packages/${shortName}`;
  const manifest = await readJson<PackageManifest>(path.resolve(root, packagePath, 'package.json'));

  if (manifest.name !== pkg.name || manifest.version !== pkg.version) {
    throw new Error(`Release summary does not match ${packagePath}/package.json for ${pkg.name}@${pkg.version}.`);
  }

  const tag = `${shortName}@${pkg.version}`;

  if (await exists('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`])) {
    throw new Error(`Tag already exists: ${tag}`);
  }

  if (await exists('gh', ['release', 'view', tag, '--json', 'tagName'])) {
    throw new Error(`GitHub Release already exists: ${tag}`);
  }

  const previousTag = await findPreviousTag(shortName);
  const notes = await generateReleaseNotes(packagePath, previousTag, tag);

  return {
    ...pkg,
    tag: tag,
    notes: notes,
  };
}

async function pushGitTags(releases: Release[]): Promise<void> {
  if (releases.length === 0) return;

  const commit = await run('git', ['rev-parse', 'HEAD']);

  for (const release of releases) {
    await run('git', ['check-ref-format', `refs/tags/${release.tag}`]);
    await run('git', ['tag', release.tag, commit]);
  }

  await run('git', ['push', '--atomic', 'origin', ...releases.map((release) => `refs/tags/${release.tag}`)]);
}

async function createGitHubReleases(releases: Release[]): Promise<void> {
  for (const release of releases) {
    await run('gh', [
      'release',
      'create',
      release.tag,
      '--verify-tag',
      '--title',
      release.tag,
      '--notes',
      release.notes,
    ]);
  }
}

async function findPreviousTag(shortName: string): Promise<string | undefined> {
  const packageTags = await run('git', ['tag', '--merged', 'HEAD', '--list', `${shortName}@*`, '--sort=-v:refname']);

  const previousPackageTag = packageTags.split('\n').find(Boolean);
  if (previousPackageTag) return previousPackageTag;

  const legacyTags = await run('git', ['tag', '--merged', 'HEAD', '--list', 'v[0-9]*', '--sort=-v:refname']);

  return legacyTags.split('\n').find(Boolean);
}

async function generateReleaseNotes(
  packagePath: string,
  previousTag: string | undefined,
  currentTag: string,
): Promise<string> {
  const range = previousTag ? `${previousTag}..HEAD` : 'HEAD';

  const log = await run('git', ['log', '--no-merges', '--format=%H%x1f%B%x1e', range, '--', packagePath]);

  const commits = log
    .split('\x1e')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const [hash = '', ...messageParts] = value.split('\x1f');

      return {
        hash: hash,
        message: messageParts.join('\x1f').trim(),
      };
    });

  if (commits.length === 0) {
    return 'No Conventional Commit changes were detected for this package.';
  }

  const parsedCommits = await parseCommits(commits.map((commit) => commit.message));
  const entries: Partial<Record<keyof typeof sections, string[]>> = {};

  parsedCommits.forEach((commit, index) => {
    const source = commits[index];
    if (!source) return;

    const type = commit.type?.toLowerCase();
    const breaking = (commit.notes?.length ?? 0) > 0 || /^\w+(?:\([^)]*\))?!:/.test(commit.header ?? '');
    const section = breaking ? 'breaking' : type;
    if (!section || !(section in sections)) return;

    const breakingSubject = commit.notes
      ?.map((note) => note.text?.replace(/\s+/g, ' ').trim())
      .filter((value): value is string => Boolean(value))
      .join(' ');

    const subject = breaking ? breakingSubject || commit.subject : commit.subject;
    if (!subject) return;

    const scope = commit.scope ? `**${commit.scope}**: ` : '';
    const shortHash = source.hash.slice(0, 7);

    const commitReference = process.env.GITHUB_REPOSITORY
      ? `[\`${shortHash}\`](https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${source.hash})`
      : `\`${shortHash}\``;

    const key = section as keyof typeof sections;

    (entries[key] ??= []).push(`- ${scope}${subject} (${commitReference})`);
  });

  const notes: string[] = [];

  for (const [type, title] of Object.entries(sections) as Array<[keyof typeof sections, string]>) {
    const sectionEntries = entries[type];
    if (!sectionEntries?.length) continue;

    notes.push(`## ${title}`, '', ...sectionEntries, '');
  }

  if (notes.length === 0) {
    notes.push('No Conventional Commit changes were detected for this package.', '');
  }

  if (previousTag && process.env.GITHUB_REPOSITORY) {
    notes.push(
      `**Full Changelog:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/${previousTag}...${currentTag}`,
    );
  }

  return notes.join('\n').trim();
}

async function parseCommits(messages: string[]): Promise<ParsedCommit[]> {
  const output = await runWithInput(
    'pnpm',
    [
      'dlx',
      commitParser,
      '--separator',
      commitSeparator,
      '--header-pattern',
      headerPattern,
      '--header-correspondence',
      'type,scope,subject',
    ],
    messages.join(commitSeparator),
  );

  const parsed: unknown = JSON.parse(output);

  if (!Array.isArray(parsed) || parsed.length !== messages.length) {
    throw new Error('Conventional Commit parser returned an unexpected result.');
  }

  return parsed as ParsedCommit[];
}

async function writeSummary(releases: Release[]): Promise<void> {
  const lines = releases.length > 0 ? releases.map((release) => `✓ ${release.tag}`) : ['No packages were published.'];

  console.log(`\n${lines.join('\n')}\n`);

  if (!process.env.GITHUB_STEP_SUMMARY) return;

  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    ['## Release summary', '', ...lines.map((line) => `- ${line}`), ''].join('\n'),
  );
}

async function exists(command: string, args: string[]): Promise<boolean> {
  try {
    await execFile(command, args, {
      cwd: root,
      encoding: 'utf8',
    });

    return true;
  } catch {
    return false;
  }
}

async function run(command: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFile(command, args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });

    return stdout.trim();
  } catch (error) {
    throw new Error(`${command} ${args.join(' ')} failed: ${getErrorMessage(error)}`);
  }
}

async function runWithInput(command: string, args: string[], input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });

    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    child.on('error', reject);

    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }

      const reason = stderr.trim() || (signal ? `terminated by signal ${signal}` : `exited with code ${code}`);
      reject(new Error(`${command} ${args.join(' ')} failed: ${reason}`));
    });

    child.stdin.end(input);
  });
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, 'utf8')) as T;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
