import path from 'node:path';

import { readJson } from '#test/fixtures/files';

export interface BuildReport {
  readonly schemaVersion: number;
  readonly targets: readonly string[];
  readonly dependencies: readonly {
    readonly from: string;
    readonly to: string;
    readonly origin: 'declared' | 'derived';
  }[];
}

export function readBuildReport(root: string): BuildReport {
  return readJson<BuildReport>(path.join(root, '.archicat/reports/build.report.json'));
}

export function hasDependency(report: BuildReport, from: string, to: string, origin: 'declared' | 'derived'): boolean {
  return report.dependencies.some(
    (dependency) => dependency.from === from && dependency.to === to && dependency.origin === origin,
  );
}
