import { CanceledError, delay } from '@buildplease/core';
import { inject, injectable } from 'inversify';

import {
  type HttpRequestTestInput,
  type HttpRequestTestOperation,
  type HttpRequestTestOutput,
  HttpRequestTestMode,
} from '~/networking/operation/http-request-test';
import type { UnauthorizedOperation } from '~/networking/operation/unauthorized';
import { AppSymbols } from '~/symbols';

export enum HttpRequestPreset {
  AllSuccess,
  ErrorMiddle,
  UnauthorizedFirst,
  UnauthorizedMiddle,
  UnauthorizedLast,
  UnauthorizedDelayed,
}

export enum HttpRequestTestStatus {
  Idle,
  Waiting,
  Running,
  Success,
  Error,
  Unauthorized,
  Canceled,
}

export interface HttpRequestTestItem {
  startDelayMs: number;
  input: Omit<HttpRequestTestInput, 'onRequestStart' | 'onResponse'>;
  output?: HttpRequestTestOutput;
  status: HttpRequestTestStatus;
  enteredAtMs?: number;
  requestStartedAtMs?: number;
  finishedAtMs?: number;
  error?: unknown;
}

export interface DashboardState {
  isLoading: boolean;
  isRunningHttpRequestTest: boolean;
  httpRequestPreset: HttpRequestPreset;
  httpRequestItems: HttpRequestTestItem[];
}

type HttpRequestPresetItem = Pick<HttpRequestTestItem, 'startDelayMs' | 'input'>;

const HTTP_REQUEST_PRESETS: Readonly<Record<HttpRequestPreset, readonly HttpRequestPresetItem[]>> = {
  [HttpRequestPreset.AllSuccess]: [
    { startDelayMs: 0, input: { index: 1, delayMs: 300, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 2, delayMs: 500, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 3, delayMs: 700, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 4, delayMs: 900, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 5, delayMs: 1100, mode: HttpRequestTestMode.Success } },
  ],
  [HttpRequestPreset.ErrorMiddle]: [
    { startDelayMs: 0, input: { index: 1, delayMs: 250, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 2, delayMs: 450, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 3, delayMs: 700, mode: HttpRequestTestMode.Error } },
    { startDelayMs: 0, input: { index: 4, delayMs: 950, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 5, delayMs: 1150, mode: HttpRequestTestMode.Success } },
  ],
  [HttpRequestPreset.UnauthorizedFirst]: [
    { startDelayMs: 0, input: { index: 1, delayMs: 250, mode: HttpRequestTestMode.Unauthorized } },
    { startDelayMs: 0, input: { index: 2, delayMs: 500, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 3, delayMs: 700, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 4, delayMs: 900, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 5, delayMs: 1100, mode: HttpRequestTestMode.Success } },
  ],
  [HttpRequestPreset.UnauthorizedMiddle]: [
    { startDelayMs: 0, input: { index: 1, delayMs: 250, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 2, delayMs: 450, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 3, delayMs: 700, mode: HttpRequestTestMode.Unauthorized } },
    { startDelayMs: 0, input: { index: 4, delayMs: 950, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 5, delayMs: 1150, mode: HttpRequestTestMode.Success } },
  ],
  [HttpRequestPreset.UnauthorizedLast]: [
    { startDelayMs: 0, input: { index: 1, delayMs: 200, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 2, delayMs: 400, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 3, delayMs: 600, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 4, delayMs: 800, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 0, input: { index: 5, delayMs: 1000, mode: HttpRequestTestMode.Unauthorized } },
  ],
  [HttpRequestPreset.UnauthorizedDelayed]: [
    { startDelayMs: 0, input: { index: 1, delayMs: 400, mode: HttpRequestTestMode.Unauthorized } },
    { startDelayMs: 0, input: { index: 2, delayMs: 1000, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 600, input: { index: 3, delayMs: 300, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 1000, input: { index: 4, delayMs: 300, mode: HttpRequestTestMode.Success } },
    { startDelayMs: 2200, input: { index: 5, delayMs: 300, mode: HttpRequestTestMode.Success } },
  ],
};

function makeHttpRequestItems(preset: HttpRequestPreset): HttpRequestTestItem[] {
  return HTTP_REQUEST_PRESETS[preset].map((item) => ({
    startDelayMs: item.startDelayMs,
    input: { ...item.input },
    status: HttpRequestTestStatus.Idle,
  }));
}

@injectable()
export class DashboardViewModel extends ViewModel<DashboardState> {
  constructor(
    @inject(AppSymbols.DI.Operation.Unauthorized)
    private readonly unauthorizedOperation: UnauthorizedOperation,
    @inject(AppSymbols.DI.Operation.HttpRequestTest)
    private readonly httpRequestTestOperation: HttpRequestTestOperation,
    @inject(AppSymbols.DI.Operation.DelayedHttpRequestTest)
    private readonly delayedHttpRequestTestOperation: HttpRequestTestOperation,
  ) {
    super({
      isLoading: false,
      isRunningHttpRequestTest: false,
      httpRequestPreset: HttpRequestPreset.AllSuccess,
      httpRequestItems: makeHttpRequestItems(HttpRequestPreset.AllSuccess),
    });
  }

  public async executeUnauthorized(): Promise<void> {
    if (this.state.isLoading) return;

    this.state.isLoading = true;

    try {
      await this.unauthorizedOperation.execute();
    } catch (error) {
      if (!(error instanceof CanceledError)) throw error;
    } finally {
      this.state.isLoading = false;
    }
  }

  public applyHttpRequestPreset(preset: HttpRequestPreset): void {
    if (this.state.isRunningHttpRequestTest) return;

    this.state.httpRequestPreset = preset;
    this.state.httpRequestItems = makeHttpRequestItems(preset);
  }

  public async executeHttpRequestTest(): Promise<void> {
    if (this.state.isRunningHttpRequestTest) return;

    this.state.isRunningHttpRequestTest = true;
    const startedAt = Date.now();
    const operation =
      this.state.httpRequestPreset === HttpRequestPreset.UnauthorizedDelayed
        ? this.delayedHttpRequestTestOperation
        : this.httpRequestTestOperation;

    for (const item of this.state.httpRequestItems) {
      delete item.output;
      delete item.error;
      delete item.enteredAtMs;
      delete item.requestStartedAtMs;
      delete item.finishedAtMs;
      item.status = HttpRequestTestStatus.Idle;
    }

    const tasks = this.state.httpRequestItems.map(async (item) => {
      await delay(item.startDelayMs);
      item.enteredAtMs = Date.now() - startedAt;
      item.status = HttpRequestTestStatus.Waiting;

      try {
        const output = await operation.execute({
          ...item.input,
          onRequestStart: () => {
            item.requestStartedAtMs = Date.now() - startedAt;
            item.status = HttpRequestTestStatus.Running;
          },
          onResponse: (mode) => {
            switch (mode) {
              case HttpRequestTestMode.Unauthorized:
                item.status = HttpRequestTestStatus.Unauthorized;
                break;
              case HttpRequestTestMode.Error:
                item.status = HttpRequestTestStatus.Error;
                break;
              case HttpRequestTestMode.Success:
                break;
            }
          },
        });

        item.output = output;
        item.status = HttpRequestTestStatus.Success;
      } catch (error) {
        if (error instanceof CanceledError) {
          item.status =
            item.input.mode === HttpRequestTestMode.Unauthorized
              ? HttpRequestTestStatus.Unauthorized
              : HttpRequestTestStatus.Canceled;
          item.error = error.cause;
          return;
        }

        item.error = error;
        item.status = HttpRequestTestStatus.Error;
      } finally {
        item.finishedAtMs = Date.now() - startedAt;
      }
    });

    try {
      await Promise.allSettled(tasks);
    } finally {
      this.state.isRunningHttpRequestTest = false;
    }
  }
}
