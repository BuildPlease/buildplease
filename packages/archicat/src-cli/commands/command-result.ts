import type { ConsolePanelRow } from '@buildplease/core/node';

// MARK: - Public

export interface ArchicatCliCommandOptions {
  readonly config?: string;
}

export type ArchicatCliPanelRow = ConsolePanelRow;

export type ArchicatCliCommandLine =
  | {
      readonly kind: 'title';
      readonly product: string;
      readonly command: string;
      readonly rows?: readonly ArchicatCliPanelRow[];
    }
  | {
      readonly kind: 'panel';
      readonly title: string;
      readonly rows: readonly ArchicatCliPanelRow[];
      readonly badge?: string | number;
    }
  | {
      readonly kind: 'success' | 'info' | 'warning' | 'error';
      readonly message: string;
      readonly label?: string;
    };

export interface ArchicatCliCommandResult {
  readonly exitCode: number;
  readonly lines: readonly ArchicatCliCommandLine[];
}
