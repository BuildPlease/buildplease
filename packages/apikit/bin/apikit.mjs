#!/usr/bin/env node
import { runMain } from '../dist/cli/index.mjs';

try {
  process.exitCode = await runMain(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
