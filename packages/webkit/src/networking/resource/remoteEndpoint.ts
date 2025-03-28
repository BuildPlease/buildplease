import type { RequestConfig } from '@/networking/resource/requestConfig';

export interface RemoteEndpoint<Input, InputDto, Output, OutputDto> {
  makeRequest(input: InputDto): Promise<RequestConfig>;
  convertInput(input: Input): Promise<InputDto>;
  convertOutput(response: OutputDto): Promise<Output>;
}
