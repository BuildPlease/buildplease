import { describe, expect, it } from 'vitest';

import { FileHttpResponse, JSONHttpResponse, ResponseType } from '@/http/http-response';

describe('HttpResponse', () => {
  it('stores JSON response metadata', () => {
    const response = new JSONHttpResponse({
      statusCode: 201,
      data: { id: '1' },
      headers: { 'x-request-id': 'request-1' },
    });

    expect(response.responseType).toBe(ResponseType.JSON);
    expect(response.statusCode).toBe(201);
    expect(response.data).toEqual({ id: '1' });
    expect(response.headers).toEqual({ 'x-request-id': 'request-1' });
  });

  it('stores file response metadata', () => {
    const response = new FileHttpResponse({
      statusCode: 200,
      filePath: '/tmp/file.pdf',
      shouldRender: true,
      data: { name: 'file.pdf' },
    });

    expect(response.responseType).toBe(ResponseType.File);
    expect(response.filePath).toBe('/tmp/file.pdf');
    expect(response.shouldRender).toBe(true);
    expect(response.data).toEqual({ name: 'file.pdf' });
  });
});
