import { filterObject, isEmptyObject } from '@buildplease/core';

import { HttpHeaders } from '@/http';
import type { RequestMetadata } from '@/request';

export class RequestLogMetadata {
  public constructor(private readonly metadata: Partial<RequestMetadata>) {}

  public toJSON(): object | undefined {
    const selectedHeaders = {
      [HttpHeaders.userAgent]: this.metadata.headers?.[HttpHeaders.userAgent],
      [HttpHeaders.contentType]: this.metadata.headers?.[HttpHeaders.contentType],
      [HttpHeaders.acceptLanguage]: this.metadata.headers?.[HttpHeaders.acceptLanguage],
      [HttpHeaders.accept]: this.metadata.headers?.[HttpHeaders.accept],
    };

    const value = filterObject(
      {
        reqId: this.metadata.requestId,
        method: this.metadata.method,
        url: this.metadata.url,
        protocol: this.metadata.protocol,
        query: this.metadata.query,
        params: this.metadata.params,
        ip: this.metadata.ip,
        locale: this.metadata.locale,
        headers: selectedHeaders,
      },
      {
        filterNull: true,
        filterUndefined: true,
        filterEmptyString: true,
        filterEmptyArray: true,
        filterEmptyObject: true,
      },
    );

    return isEmptyObject(value) ? undefined : value;
  }
}
