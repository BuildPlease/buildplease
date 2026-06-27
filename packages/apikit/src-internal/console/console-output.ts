import { createConsola } from 'consola';
import { colors } from 'consola/utils';

const consoleInstance = createConsola({
  level: +999,
  formatOptions: {
    colors: true,
    date: false,
  },
});

export interface ConsolePanelRow {
  readonly label: string;
  readonly value: string | number;
}

interface PanelDefinition {
  readonly title: string;
  readonly renderedTitle: string;
  readonly rows: readonly ConsolePanelRow[];
  readonly formatValue: (value: string) => string;
}

const ANSI_PATTERN = /\u001B\[[0-9;]*m/g;
const PANEL_MIN_WIDTH = 48;
const PANEL_LABEL_WIDTH = 14;
const STEP_LABEL_WIDTH = 10;

export class ConsoleOutput {
  public static title(product: string, command: string, rows: readonly ConsolePanelRow[] = []): void {
    printPanel({
      title: `${product} ${command}`.trim(),
      renderedTitle: `${colors.cyan(colors.bold(product))}${command ? ` ${colors.dim(command)}` : ''}`,
      rows,
      formatValue: colors.green,
    });
  }

  public static panel(title: string, rows: readonly ConsolePanelRow[], badge?: string | number): void {
    printPanel({
      title: badge === undefined ? title : `${title} ${badge}`,
      renderedTitle: `${colors.cyan(colors.bold(title))}${badge === undefined ? '' : ` ${colors.green(String(badge))}`}`,
      rows,
      formatValue: colors.dim,
    });
  }

  public static step(label: string, message: string): string {
    return `${colors.cyan(label.padEnd(STEP_LABEL_WIDTH, ' '))}${message}`;
  }

  public static duration(ms: number): string {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  }

  public static emptyLine(): void {
    consoleInstance.log('');
  }

  public static log(message?: unknown, ...args: unknown[]): void {
    consoleInstance.log(message, ...args);
  }

  public static info(message?: unknown, ...args: unknown[]): void {
    consoleInstance.info(message, ...args);
  }

  public static success(message?: unknown, ...args: unknown[]): void {
    consoleInstance.success(message, ...args);
  }

  public static error(message?: unknown, ...args: unknown[]): void {
    consoleInstance.error(message, ...args);
  }
}

function printPanel(panel: PanelDefinition): void {
  consoleInstance.log(formatPanel(panel));
}

function formatPanel(panel: PanelDefinition): string {
  const width = getPanelWidth(panel);

  return [
    formatPanelTop(panel.renderedTitle, width),
    ...panel.rows.map((row) => formatPanelRow(row, width, panel.formatValue)),
    formatPanelBottom(width),
  ].join('\n');
}

function formatPanelTop(renderedTitle: string, width: number): string {
  const gap = Math.max(1, width - visibleLength(renderedTitle) - 5);

  return `${colors.dim('╭─')} ${renderedTitle} ${colors.dim('─'.repeat(gap))}${colors.dim('╮')}`;
}

function formatPanelBottom(width: number): string {
  return `${colors.dim('╰')}${colors.dim('─'.repeat(width - 2))}${colors.dim('╯')}`;
}

function formatPanelRow(row: ConsolePanelRow, width: number, formatValue: (value: string) => string): string {
  const label = row.label.padEnd(PANEL_LABEL_WIDTH, ' ');
  const value = String(row.value);
  const lineWidth = visibleLength(label) + visibleLength(value) + 4;
  const padding = Math.max(0, width - lineWidth);

  return `${colors.dim('│')} ${colors.blue(label)}${formatValue(value)}${' '.repeat(padding)} ${colors.dim('│')}`;
}

function getPanelWidth(panel: PanelDefinition): number {
  return Math.max(PANEL_MIN_WIDTH, getTitleWidth(panel), getRowsWidth(panel.rows));
}

function getTitleWidth(panel: PanelDefinition): number {
  return visibleLength(panel.title) + 6;
}

function getRowsWidth(rows: readonly ConsolePanelRow[]): number {
  return Math.max(0, ...rows.map(getRowWidth));
}

function getRowWidth(row: ConsolePanelRow): number {
  return PANEL_LABEL_WIDTH + visibleLength(String(row.value)) + 4;
}

function visibleLength(value: string): number {
  return value.replace(ANSI_PATTERN, '').length;
}
