import type { HttpRequest } from './http-request';

/**
 * Defines conversion and request creation for a remote operation.
 */
export interface RemoteEndpoint<Input, InputDto, Output, OutputDto, Client> {
  /** Converts operation input to the request DTO. */
  convertInput(input: Input): Promise<InputDto>;

  /** Creates the HTTP request for the converted input. */
  makeRequest(input: InputDto): HttpRequest<Client, OutputDto>;

  /** Converts the response DTO to the operation output. */
  convertOutput(response: OutputDto): Promise<Output>;
}
