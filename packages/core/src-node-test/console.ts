import { Console } from '@src-node/console';

export function makeConsoleFixture(): Console {
  return new Console({ enabled: false });
}
