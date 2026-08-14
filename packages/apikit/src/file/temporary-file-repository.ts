import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline as pipelineAsync } from 'node:stream/promises';

import { CoreSymbols } from '@meawkit/core';
import { type Logger, createDirectoryAsync, ensureDirectoryAsync, removePathAsync } from '@meawkit/core/node';
import { inject, injectable } from 'inversify';

import type { FormatType } from '@/formatter';

const LOG_PREFIX = '[ApiKit:TemporaryFile]';

export interface TemporaryFileRepository {
  /**
   * Absolute path to the OS temporary directory used as a root for all operations.
   */
  get rootDirectory(): string;

  /**
   * Ensure a subdirectory under the temp root exists.
   *
   * @param relativePath - A subpath like `request-id/cover`. Treated as relative to the temp root.
   * @returns Absolute path to the created/existing directory.
   * @throws If the directory cannot be created.
   */
  createDirectory(relativePath: string): Promise<string>;

  /**
   * Remove a directory (recursively) under the temp root.
   *
   * @param relativePath - A subpath like `request-id/cover`. Treated as relative to the temp root.
   * @returns Resolves when deletion completes. No-op if it doesn’t exist.
   * @throws If the deletion fails.
   */
  deleteDirectory(relativePath: string): Promise<void>;

  /**
   * Persist a file under the temp root.
   *
   * The final filename will be `<filename>.<type.extension>`.
   *
   * @param filename - Basename without extension (e.g., `cover`, `preview_0`).
   * @param content - Buffer or Readable stream to write.
   * @param type - Output type providing the file extension.
   * @param relativeDirectory - Subdirectory under the temp root (e.g., `request-id/cover`).
   * @returns Absolute file path written on disk.
   * @throws If writing fails or content type is unsupported.
   */
  save(
    filename: string,
    content: NodeJS.ReadableStream | Buffer,
    type: FormatType,
    relativeDirectory: string,
  ): Promise<string>;

  /**
   * Remove a file under the temp root.
   *
   * @param relativeFilePath - Subpath like `request-id/cover/cover.jpeg`.
   * @returns Resolves when deletion completes. No-op if it doesn’t exist.
   * @throws If the deletion fails.
   */
  delete(relativeFilePath: string): Promise<void>;
}

@injectable()
export class TemporaryFileRepositoryImpl implements TemporaryFileRepository {
  private readonly rootDir: string;

  constructor(
    @inject(CoreSymbols.DI.Logger)
    private readonly logger: Logger,
  ) {
    this.rootDir = os.tmpdir();
  }

  get rootDirectory(): string {
    return this.rootDir;
  }

  async createDirectory(relativePath: string): Promise<string> {
    const abs = this.safeJoin(relativePath);
    try {
      return await createDirectoryAsync(abs);
    } catch (error) {
      this.logger.error(`${LOG_PREFIX} Create directory failed`, { error: error, details: { abs: abs } });
      throw error;
    }
  }

  async deleteDirectory(relativePath: string): Promise<void> {
    const abs = this.safeJoin(relativePath);
    try {
      await removePathAsync(abs, { recursive: true, force: true });
    } catch (error) {
      this.logger.error(`${LOG_PREFIX} Delete directory failed`, { error: error, details: { abs: abs } });
      throw error;
    }
  }

  async save(
    filename: string,
    content: NodeJS.ReadableStream | Buffer,
    type: FormatType,
    relativeDirectory: string,
  ): Promise<string> {
    const dirAbs = this.safeJoin(relativeDirectory);
    const fileAbs = path.join(dirAbs, `${filename}.${type.extension}`);

    try {
      // Ensure parent directory exists (and is a directory).
      await createDirectoryAsync(dirAbs);
      await ensureDirectoryAsync(dirAbs);

      if (Buffer.isBuffer(content)) {
        await fs.promises.writeFile(fileAbs, content);
        return fileAbs;
      }

      if (content instanceof Readable) {
        const writeStream = fs.createWriteStream(fileAbs);
        try {
          await pipelineAsync(content, writeStream);
          return fileAbs;
        } finally {
          writeStream.close();
        }
      }

      const error = new Error('Unsupported content type: expected Buffer or Readable.');

      this.logger.error(`${LOG_PREFIX} Save unsupported content`, {
        error: error,
        details: { fileAbs: fileAbs, typeof: typeof content },
      });
      throw error;
    } catch (error) {
      this.logger.error(`${LOG_PREFIX} Save failed`, {
        error: error,
        details: {
          fileAbs: fileAbs,
          relativeDirectory: relativeDirectory,
          filename: filename,
          extension: type.extension,
        },
      });
      throw error;
    }
  }

  async delete(relativeFilePath: string): Promise<void> {
    const abs = this.safeJoin(relativeFilePath);
    try {
      await removePathAsync(abs, { recursive: false, force: true });
    } catch (error) {
      this.logger.error(`${LOG_PREFIX} Delete failed`, { error: error, details: { abs: abs } });
      throw error;
    }
  }

  /**
   * Resolve a user-provided relative path against the repository root,
   * normalize it, and reject traversal outside the root.
   */
  private safeJoin(relativePath: string): string {
    const joined = path.resolve(this.rootDir, relativePath);
    const rootWithSep = this.rootDir.endsWith(path.sep) ? this.rootDir : this.rootDir + path.sep;

    if (!joined.startsWith(rootWithSep) && joined !== this.rootDir) {
      const error = new Error(`Path escapes repository root: "${relativePath}"`);
      this.logger.error(`${LOG_PREFIX} Path traversal attempt`, {
        error: error,
        details: { root: this.rootDir, attempted: joined },
      });
      throw error;
    }

    return joined;
  }
}
