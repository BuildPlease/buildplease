import fs from 'fs';
import path from 'path';

/**
 * Writes the generated TypeScript file to the disk.
 */
export async function writeGeneratedFile(
  outputPath: string,
  filename: string,
  content: string,
): Promise<void> {
  const filePath = path.join(outputPath, filename);
  await fs.promises.writeFile(filePath, content, 'utf-8');
}
