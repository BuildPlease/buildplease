import { type ConsolaInstance, createConsola } from 'consola';
import { colors } from 'consola/utils';

import type { ConsoleOptions } from './console-options';

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

export class Console {
  private readonly instance: ConsolaInstance;

  public constructor(options: ConsoleOptions = {}) {
    this.instance = createConsola({
      level: options.enabled === false ? -999 : +999,
      formatOptions: {
        colors: true,
        date: false,
      },
    });
  }

  public title(product: string, command: string, rows: readonly ConsolePanelRow[] = []): void {
    this.printPanel({
      title: `${product} ${command}`.trim(),
      renderedTitle: `${colors.cyan(colors.bold(product))}${command ? ` ${colors.dim(command)}` : ''}`,
      rows: rows,
      formatValue: colors.green,
    });
  }

  public panel(title: string, rows: readonly ConsolePanelRow[], badge?: string | number): void {
    this.printPanel({
      title: badge === undefined ? title : `${title} ${badge}`,
      renderedTitle: `${colors.cyan(colors.bold(title))}${
        badge === undefined ? '' : ` ${colors.green(String(badge))}`
      }`,
      rows: rows,
      formatValue: colors.dim,
    });
  }

  public step(label: string, message: string): string {
    return `${colors.cyan(label.padEnd(STEP_LABEL_WIDTH, ' '))}${message}`;
  }

  public duration(ms: number): string {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  }

  public emptyLine(): void {
    this.instance.log('');
  }

  public log(message?: unknown, ...args: unknown[]): void {
    this.instance.log(message, ...args);
  }

  public info(message?: unknown, ...args: unknown[]): void {
    this.instance.info(message, ...args);
  }

  public start(message?: unknown, ...args: unknown[]): void {
    this.instance.start(message, ...args);
  }

  public success(message?: unknown, ...args: unknown[]): void {
    this.instance.success(message, ...args);
  }

  public warn(message?: unknown, ...args: unknown[]): void {
    this.instance.warn(message, ...args);
  }

  public error(message?: unknown, ...args: unknown[]): void {
    this.instance.error(message, ...args);
  }

  public debug(message?: unknown, ...args: unknown[]): void {
    this.instance.debug(message, ...args);
  }

  private printPanel(panel: PanelDefinition): void {
    this.instance.log(this.formatPanel(panel));
  }

  private formatPanel(panel: PanelDefinition): string {
    const width = this.getPanelWidth(panel);

    return [
      this.formatPanelTop(panel.renderedTitle, width),
      ...panel.rows.map((row) => this.formatPanelRow(row, width, panel.formatValue)),
      this.formatPanelBottom(width),
    ].join('\n');
  }

  private formatPanelTop(renderedTitle: string, width: number): string {
    const gap = Math.max(1, width - this.visibleLength(renderedTitle) - 5);

    return `${colors.dim('╭─')} ${renderedTitle} ${colors.dim('─'.repeat(gap))}${colors.dim('╮')}`;
  }

  private formatPanelBottom(width: number): string {
    return `${colors.dim('╰')}${colors.dim('─'.repeat(width - 2))}${colors.dim('╯')}`;
  }

  private formatPanelRow(row: ConsolePanelRow, width: number, formatValue: (value: string) => string): string {
    const label = row.label.padEnd(PANEL_LABEL_WIDTH, ' ');
    const value = String(row.value);
    const lineWidth = this.visibleLength(label) + this.visibleLength(value) + 4;
    const padding = Math.max(0, width - lineWidth);

    return `${colors.dim('│')} ${colors.blue(label)}${formatValue(value)}${' '.repeat(padding)} ${colors.dim('│')}`;
  }

  private getPanelWidth(panel: PanelDefinition): number {
    return Math.max(PANEL_MIN_WIDTH, this.getTitleWidth(panel), this.getRowsWidth(panel.rows));
  }

  private getTitleWidth(panel: PanelDefinition): number {
    return this.visibleLength(panel.title) + 6;
  }

  private getRowsWidth(rows: readonly ConsolePanelRow[]): number {
    return Math.max(0, ...rows.map((row) => this.getRowWidth(row)));
  }

  private getRowWidth(row: ConsolePanelRow): number {
    return PANEL_LABEL_WIDTH + this.visibleLength(String(row.value)) + 4;
  }

  private visibleLength(value: string): number {
    return value.replace(ANSI_PATTERN, '').length;
  }
}
