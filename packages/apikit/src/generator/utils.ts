import fs from 'fs';
import path from 'path';

/**
 * Prepares the build output directory.
 */
export async function prepareGeneratedDirectory(
  outDir: string,
): Promise<string> {
  const outputPath = path.resolve(process.cwd(), outDir);

  if (fs.existsSync(outputPath)) {
    fs.rmSync(outputPath, { recursive: true, force: true });
  }
  fs.mkdirSync(outputPath, { recursive: true });

  return outputPath;
}

/**
 * Writes the generated TypeScript file to the disk.
 */
export async function writeGeneratedFile(outputPath: string, content: string) {
  fs.writeFileSync(path.join(outputPath, 'environment.ts'), content);
}
