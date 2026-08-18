import fs from 'node:fs';
import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration/archicat-defaults';
import { assertSafeGeneratedDirectory } from '@src-internal/path';

// MARK: - File writing

export function resetDirectory(rootDir: string, directoryPath: string): void {
  assertSafeGeneratedDirectory(rootDir, directoryPath);
  assertReplaceableDirectory(rootDir, directoryPath);

  fs.rmSync(directoryPath, { recursive: true, force: true });
  fs.mkdirSync(directoryPath, { recursive: true });
}

export function writeTextFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

export function writeJsonFile(filePath: string, value: unknown): void {
  writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

// MARK: - Generated directory ownership

function assertReplaceableDirectory(rootDir: string, directoryPath: string): void {
  if (!fs.existsSync(directoryPath) || fs.readdirSync(directoryPath).length === 0) {
    return;
  }

  if (isOwnedGeneratedDirectory(rootDir, directoryPath)) {
    return;
  }

  throw new Error(`Archicat refuses to replace a non-owned outDir: ${directoryPath}`);
}

function isOwnedGeneratedDirectory(rootDir: string, directoryPath: string): boolean {
  const reportPath = path.join(
    directoryPath,
    ArchicatDefaults.generated.reportsDirName,
    ArchicatDefaults.generated.buildReportFileName,
  );

  if (!fs.existsSync(reportPath)) {
    return false;
  }

  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as {
      generatedBy?: unknown;
      schemaVersion?: unknown;
      outputs?: { outDir?: unknown };
    };

    return (
      report.generatedBy === 'archicat' &&
      report.schemaVersion === 2 &&
      typeof report.outputs?.outDir === 'string' &&
      path.resolve(rootDir, report.outputs.outDir) === path.resolve(directoryPath)
    );
  } catch {
    return false;
  }
}
