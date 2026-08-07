import { describe, expect, it } from 'vitest';

import { type RemoteEndpoint, type RemoteRequestConfig, BaseRemoteResource, HttpError } from '@/networking';

class HttpErrorEndpoint implements RemoteEndpoint<void, void, void, void> {
  constructor(private readonly error: HttpError) {}

  public async makeRequest(_input: void, _options?: RemoteRequestConfig): Promise<void> {
    throw this.error;
  }

  public async convertInput(input: void): Promise<void> {
    return input;
  }

  public async convertOutput(response: void): Promise<void> {
    return response;
  }
}

class TestRemoteResource extends BaseRemoteResource<void, void, RemoteEndpoint<void, void, void, void>> {}

describe('BaseRemoteResource', () => {
  it('preserves an already-normalized HttpError', async () => {
    const error = new HttpError({
      statusCode: 401,
      code: 'unauthorized',
      message: 'Unauthorized',
    });
    const resource = new TestRemoteResource(new HttpErrorEndpoint(error));

    await expect(resource.execute(undefined)).rejects.toBe(error);
  });
});
