#!/usr/bin/env node
import { fileURLToPath } from 'node:url';

import { runMain } from '../dist/cli/index.mjs';

globalThis.__apikit_cli__ = {
  startTime: Date.now(),
  entry: fileURLToPath(import.meta.url),
};

runMain();
