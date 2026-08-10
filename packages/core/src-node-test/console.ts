import { Console } from '@node/console';

export function makeConsoleFixture(): Console {
  return new Console({ enabled: false });
}
