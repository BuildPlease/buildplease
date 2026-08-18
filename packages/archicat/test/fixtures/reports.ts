import path from 'node:path';

import { readJson } from '#test/fixtures/files';

// MARK: - Report fixtures

export interface BuildReportDependency {
  from: string;
  to: string;
  origin: 'declared' | 'derived';
}

export interface BuildReport {
  schemaVersion: number;
  aliases: {
    module: string;
    library: string;
  };
  targets: string[];
  dependencies: BuildReportDependency[];
}

export function readBuildReport(root: string): BuildReport {
  return readJson(path.join(root, '.archicat/reports/build.report.json')) as BuildReport;
}

export function findDependency(report: BuildReport, from: string, to: string): BuildReportDependency | undefined {
  return report.dependencies.find((dependency) => dependency.from === from && dependency.to === to);
}

export function hasDependencyOrigin(report: BuildReport, origin: BuildReportDependency['origin']): boolean {
  return report.dependencies.some((dependency) => dependency.origin === origin);
}
