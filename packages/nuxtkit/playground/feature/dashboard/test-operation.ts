import { injectable, inject } from 'inversify';

import {
  type AsyncOperation,
  type RemoteRequestConfig,
  type RemoteEndpoint,
  delay,
  HttpError,
} from '@meawkit/webkit';

export interface TestOperationInput {
  index: number;
  delayMs: number;
  mode: 'success' | 'unauthorized' | 'error';
}

export interface TestOperationOutput {
  index: number;
  message: string;
}

export type TestOperation = AsyncOperation<TestOperationInput, TestOperationOutput>;

@injectable()
export class TestEndpoint implements RemoteEndpoint<
  TestOperationInput,
  TestOperationInput,
  TestOperationOutput,
  TestOperationOutput
> {
  async makeRequest(input: TestOperationInput, _options?: RemoteRequestConfig): Promise<TestOperationOutput> {
    await delay(input.delayMs);

    if (input.mode === 'unauthorized') {
      throw new HttpError({
        statusCode: 401,
        code: 'unauthorized',
        message: `Unauthorized at ${input.index}`,
      });
    }

    if (input.mode === 'error') {
      throw new HttpError({
        statusCode: 500,
        code: 'error',
        message: `Error at ${input.index}`,
      });
    }

    return {
      index: input.index,
      message: `Success ${input.index}`,
    };
  }

  async convertInput(input: TestOperationInput): Promise<TestOperationInput> {
    return input;
  }

  async convertOutput(output: TestOperationOutput): Promise<TestOperationOutput> {
    return output;
  }
}

@injectable()
export class TestResource extends SecuredRemoteResource<TestOperationInput, TestOperationOutput> {
  constructor(@inject(TestEndpoint) endpoint: TestEndpoint) {
    super(endpoint);
  }

  protected override unauthorizedMode(): 'notify' | 'silent' {
    return 'silent';
  }
}
