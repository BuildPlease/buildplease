import type { RequestConfig } from '@/networking';

export interface RemoteEndpoint<Input, InputDto, Output, OutputDto> {
  makeRequest(input: InputDto, options?: RequestConfig): Promise<OutputDto>;
  convertInput(input: Input): Promise<InputDto>;
  convertOutput(response: OutputDto): Promise<Output>;
}
