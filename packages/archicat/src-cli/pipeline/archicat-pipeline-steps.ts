import { doctorProject } from '@src-internal/doctor';
import { generateArtifacts } from '@src-internal/generator';
import { formatViolation, validateProject } from '@src-internal/validator';

import type { ArchicatPipelineStep } from './archicat-pipeline';
import type { ArchicatCliCommandResult } from '../commands/index';

// MARK: - Public

export function doctorStep(): ArchicatPipelineStep {
  return {
    name: 'doctor',
    async run(context): Promise<ArchicatCliCommandResult> {
      const issues = doctorProject(await context.getProject());

      if (issues.length === 0) {
        return successStep('doctor', 'Project diagnostics passed');
      }

      const hasErrors = issues.some((issue) => issue.severity === 'error');

      return {
        exitCode: hasErrors ? 1 : 0,
        lines: [
          {
            kind: hasErrors ? 'error' : 'warning',
            label: 'doctor',
            message: hasErrors ? 'Project diagnostics failed' : 'Project diagnostics completed with warnings',
          },
          ...issues.map(
            (issue) =>
              ({
                kind: issue.severity === 'error' ? 'error' : 'warning',
                message: `  ${issue.message}`,
              }) as const,
          ),
        ],
      };
    },
  };
}

export function validateStep(): ArchicatPipelineStep {
  return {
    name: 'validate',
    async run(context): Promise<ArchicatCliCommandResult> {
      const violations = validateProject(await context.getProject());

      if (violations.length === 0) {
        return successStep('validate', 'Architecture boundaries passed');
      }

      return {
        exitCode: 1,
        lines: [
          { kind: 'error', label: 'validate', message: 'Architecture validation failed' },
          ...violations.map((violation) => ({ kind: 'error' as const, message: formatViolation(violation) })),
        ],
      };
    },
  };
}

export function generateStep(): ArchicatPipelineStep {
  return {
    name: 'generate',
    async run(context): Promise<ArchicatCliCommandResult> {
      const project = await context.getProject();
      generateArtifacts(project);

      return {
        exitCode: 0,
        lines: [
          {
            kind: 'panel',
            title: 'mirrored',
            rows: [
              { label: 'modules', value: project.modules.length },
              { label: 'libraries', value: project.libraries.length },
              { label: 'apps', value: project.apps.length },
            ],
          },
        ],
      };
    },
  };
}

// MARK: - Private

function successStep(label: string, message: string): ArchicatCliCommandResult {
  return {
    exitCode: 0,
    lines: [{ kind: 'success', label: label, message: message }],
  };
}
