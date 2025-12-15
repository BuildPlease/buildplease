import type { RemoteRequestConfig } from '@/networking';

export interface RemoteEndpoint<Input, InputDto, Output, OutputDto> {
  makeRequest(input: InputDto, options?: RemoteRequestConfig): Promise<OutputDto>;
  convertInput(input: Input): Promise<InputDto>;
  convertOutput(response: OutputDto): Promise<Output>;
}
