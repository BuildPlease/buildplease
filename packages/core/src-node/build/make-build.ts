import type { Build } from '@neutral/build';

import type { PackageJSONModel } from '../package-json';

export function makeBuild(pkg: Pick<PackageJSONModel, 'name' | 'version'>): Build {
  return {
    name: {
      original: pkg.name.original,
      base: pkg.name.base,
    },
    version: pkg.version,
  };
}
