import path from 'node:path';

import { Console } from '@buildplease/core/node';
import { loadArchicatProject } from '@src-internal/context';
import { doctorProject } from '@src-internal/doctor';
import { generateArtifacts } from '@src-internal/generator';
import type { ResolvedArchicatProject } from '@src-internal/model';
import { formatViolation, validateProject } from '@src-internal/validator';

import type { ArchicatCliCommandLine, ArchicatCliCommandOptions, ArchicatCliCommandResult } from './command-result';

const cli = new Console();

export type ArchicatProjectCommand = 'generate' | 'validate' | 'doctor';

export async function runProjectCommand(
  command: ArchicatProjectCommand,
  options: ArchicatCliCommandOptions,
  cwd: string,
): Promise<ArchicatCliCommandResult> {
  const startedAt = Date.now();
  const project = await loadArchicatProject(cwd, options.config);
  const title = makeTitle(command, cwd, project);
  const panels: ArchicatCliCommandLine[] = [];
  const lines: ArchicatCliCommandLine[] = [];

  if (command === 'doctor' || command === 'generate') {
    lines.push(...makeDoctorLines(project));
  }

  if (command === 'validate' || command === 'generate') {
    const validation = makeValidationResult(project);
    lines.push(...validation.lines);

    if (validation.exitCode !== 0) {
      return finishResult(title, panels, lines, validation.exitCode, startedAt);
    }
  }

  if (command === 'generate') {
    generateArtifacts(project);
    panels.push({
      kind: 'panel',
      title: 'mirrored',
      rows: [
        { label: 'modules', value: project.modules.length },
        { label: 'libraries', value: project.libraries.length },
        { label: 'apps', value: project.apps.length },
      ],
    });
  }

  return finishResult(title, panels, lines, 0, startedAt);
}

function makeDoctorLines(project: ResolvedArchicatProject): ArchicatCliCommandLine[] {
  const issues = doctorProject(project);

  if (issues.length === 0) {
    return [{ kind: 'success', label: 'doctor', message: 'Project diagnostics passed' }];
  }

  return [
    { kind: 'warning', label: 'doctor', message: 'Project diagnostics completed with warnings' },
    ...issues.map((message) => ({ kind: 'warning' as const, message: `  ${message}` })),
  ];
}

function makeValidationResult(project: ResolvedArchicatProject): ArchicatCliCommandResult {
  const violations = validateProject(project);

  if (violations.length === 0) {
    return {
      exitCode: 0,
      lines: [{ kind: 'success', label: 'validate', message: 'Architecture boundaries passed' }],
    };
  }

  return {
    exitCode: 1,
    lines: [
      { kind: 'error', label: 'validate', message: 'Architecture validation failed' },
      ...violations.map((violation) => ({ kind: 'error' as const, message: formatViolation(violation) })),
    ],
  };
}

function finishResult(
  title: Extract<ArchicatCliCommandLine, { kind: 'title' }>,
  panels: readonly ArchicatCliCommandLine[],
  lines: readonly ArchicatCliCommandLine[],
  exitCode: number,
  startedAt: number,
): ArchicatCliCommandResult {
  const status: ArchicatCliCommandLine =
    exitCode === 0
      ? {
          kind: 'success',
          label: 'done',
          message: `Completed in ${cli.duration(Date.now() - startedAt)}`,
        }
      : {
          kind: 'error',
          label: 'failed',
          message: `Failed in ${cli.duration(Date.now() - startedAt)}`,
        };

  return {
    exitCode: exitCode,
    lines: [title, ...panels, ...lines, status, { kind: 'info', message: '' }],
  };
}

function makeTitle(
  command: ArchicatProjectCommand,
  cwd: string,
  project: ResolvedArchicatProject,
): Extract<ArchicatCliCommandLine, { kind: 'title' }> {
  return {
    kind: 'title',
    product: 'ArchiCat',
    command: command,
    rows: [
      { label: 'config', value: formatPath(cwd, project.configFilePath) },
      { label: 'output', value: formatPath(cwd, project.outDir) },
    ],
  };
}

function formatPath(cwd: string, filePath: string): string {
  const relativePath = path.relative(cwd, filePath);

  if (!relativePath || relativePath.startsWith('..')) {
    return filePath;
  }

  return relativePath;
}
