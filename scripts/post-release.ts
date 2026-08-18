/// <reference types="node" />

import { execFile as execFileCallback, spawn } from 'node:child_process';
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const root = process.cwd();

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

type PublishedPackage = {
  name: string;
  version: string;
};

type Release = PublishedPackage & {
  path: string;
  tag: string;
  notes: string;
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
  const published = await loadPublishedPackages();
  const releases = await prepareReleases(published);

  await pushGitTags(releases);
  await createGitHubReleases(releases);
  await writeSummary(releases);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`::error title=Post release failed::${message.replaceAll('\n', ' ')}`);
  console.error(`Post-release failed: ${message}`);

  process.exitCode = 1;
}

async function loadPublishedPackages(): Promise<PublishedPackage[]> {
  const summary = await readJson('pnpm-publish-summary.json');

  if (!summary || !Array.isArray(summary.publishedPackages)) {
    throw new Error('pnpm-publish-summary.json is missing or invalid.');
  }

  return summary.publishedPackages.map((pkg: unknown) => {
    if (!pkg || typeof pkg !== 'object') {
      throw new Error('Invalid package in pnpm publish summary.');
    }

    const { name, version } = pkg as Partial<PublishedPackage>;

    if (!name || !version) {
      throw new Error('Published package is missing name or version.');
    }

    return { name: name, version: version };
  });
}

async function prepareReleases(published: PublishedPackage[]): Promise<Release[]> {
  if (published.length === 0) return [];

  if (process.env.GITHUB_REPOSITORY) {
    await run('gh', ['repo', 'view', process.env.GITHUB_REPOSITORY, '--json', 'nameWithOwner']);
  }

  return Promise.all(published.map(prepareRelease));
}

async function prepareRelease(pkg: PublishedPackage): Promise<Release> {
  const shortName = pkg.name.split('/').at(-1);

  if (!shortName) {
    throw new Error(`Invalid package name: ${pkg.name}`);
  }

  const packagePath = `packages/${shortName}`;
  const manifest = await readJson(path.join(packagePath, 'package.json'));

  if (manifest?.name !== pkg.name || manifest?.version !== pkg.version) {
    throw new Error(`Publish summary does not match ${packagePath}/package.json for ${pkg.name}@${pkg.version}.`);
  }

  const tag = `${shortName}@${pkg.version}`;

  if (await exists('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`])) {
    throw new Error(`Tag already exists: ${tag}`);
  }

  if (await exists('gh', ['release', 'view', tag, '--json', 'tagName'])) {
    throw new Error(`GitHub release already exists: ${tag}`);
  }

  const previousTag = await findPreviousTag(shortName);
  const notes = await generateReleaseNotes(packagePath, previousTag, tag);

  return {
    ...pkg,
    path: packagePath,
    tag: tag,
    notes: notes,
  };
}

async function pushGitTags(releases: Release[]): Promise<void> {
  if (releases.length === 0) return;

  const commit = await run('git', ['rev-parse', 'HEAD']);

  for (const { tag } of releases) {
    await run('git', ['check-ref-format', `refs/tags/${tag}`]);
    await run('git', ['tag', tag, commit]);
  }

  await run('git', ['push', '--atomic', 'origin', ...releases.map(({ tag }) => `refs/tags/${tag}`)]);
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
  const previous = packageTags.split('\n').find(Boolean);

  if (previous) return previous;

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
      const [hash = '', ...message] = value.split('\x1f');

      return {
        hash: hash,
        message: message.join('\x1f').trim(),
      };
    });

  if (commits.length === 0) {
    return 'No Conventional Commit changes were detected for this package.';
  }

  const parsed = await parseCommits(commits.map(({ message }) => message));
  const entries: Record<string, string[]> = {};

  parsed.forEach((commit, index) => {
    const source = commits[index];

    if (!source) return;

    const type = commit.type?.toLowerCase();
    const breaking = (commit.notes?.length ?? 0) > 0 || /^\w+(?:\([^)]*\))?!:/.test(commit.header ?? '');
    const section = breaking ? 'breaking' : type;

    const subject = breaking
      ? commit.notes
          ?.map(({ text }) => text?.replace(/\s+/g, ' ').trim())
          .filter(Boolean)
          .join(' ') || commit.subject
      : commit.subject;

    if (!section || !(section in sections) || !subject) return;

    const scope = commit.scope ? `**${commit.scope}**: ` : '';
    const hash = source.hash.slice(0, 7);

    const link = process.env.GITHUB_REPOSITORY
      ? `[\`${hash}\`](https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${source.hash})`
      : `\`${hash}\``;

    (entries[section] ??= []).push(`- ${scope}${subject} (${link})`);
  });

  const notes = Object.entries(sections).flatMap(([type, title]) =>
    entries[type]?.length ? [`## ${title}`, '', ...entries[type], ''] : [],
  );

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
  const lines = releases.length ? releases.map(({ tag }) => `✓ ${tag}`) : ['No packages were published.'];

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

    return String(stdout).trim();
  } catch (error) {
    throw new Error(`${command} ${args.join(' ')} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function runWithInput(command: string, args: string[], input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
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

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} failed${stderr.trim() ? `: ${stderr.trim()}` : ` with exit code ${code}`}`,
        ),
      );
    });

    child.stdin.end(input);
  });
}

async function readJson(file: string) {
  return JSON.parse(await readFile(path.resolve(root, file), 'utf8'));
}
