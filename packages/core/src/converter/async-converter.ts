/**
 * Base class for asynchronous data conversion between two types.
 *
 * @template Input - The source data type.
 * @template Output - The target data type.
 */
export abstract class AsyncConverter<Input, Output> {
  /**
   * Converts a single input into the target output type asynchronously.
   *
   * @param input - The input data to convert.
   * @returns A promise resolving to the converted output.
   */
  abstract convert(input: Input): Promise<Output>;

  /**
   * Converts an array of inputs into outputs asynchronously.
   *
   * @param inputs - An array of input data.
   * @returns A promise resolving to an array of converted outputs.
   */
  async convertArray(inputs: Input[]): Promise<Output[]> {
    return Promise.all(inputs.map((input) => this.convert(input)));
  }

  /**
   * Converts an array of inputs, skipping invalid entries asynchronously.
   *
   * @param inputs - An array of input data.
   * @returns A promise resolving to an array of valid outputs, ignoring errors.
   */
  async convertArrayIgnoreInvalid(inputs: Input[]): Promise<Output[]> {
    const results: Output[] = [];

    for (const input of inputs) {
      try {
        const output = await this.convert(input);
        results.push(output);
      } catch {
        // Skip invalid input
      }
    }

    return results;
  }
}
