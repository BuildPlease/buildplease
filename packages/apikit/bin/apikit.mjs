#!/usr/bin/env node
import path from 'node:path';

import { loadPackageJSON, resolvePath } from '@meawkit/core/node';

import { runMain } from '../dist/cli/index.mjs';

const packageRoot = resolvePath(import.meta.url, '..');
const pkg = loadPackageJSON(path.join(packageRoot, 'package.json'));

runMain({
  startTime: Date.now(),
  package: {
    name: pkg.name.original,
    version: pkg.version,
  },
  resourcesPath: path.join(packageRoot, 'resources'),
});
