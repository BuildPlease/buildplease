/**
 * Base class for synchronous data conversion between two types.
 *
 * @template Input - The source data type.
 * @template Output - The target data type.
 */
export abstract class Converter<Input, Output> {
  /**
   * Converts a single input into the target output type.
   *
   * @param input - The input data to convert.
   * @returns The converted output.
   */
  abstract convert(input: Input): Output;

  /**
   * Converts an array of inputs into outputs.
   *
   * @param inputs - An array of input data.
   * @returns An array of converted outputs.
   */
  convertArray(inputs: Input[]): Output[] {
    return inputs.map((input) => this.convert(input));
  }

  /**
   * Converts an array of inputs, skipping invalid entries.
   *
   * @param inputs - An array of input data.
   * @returns An array of valid outputs, ignoring errors.
   */
  convertArrayIgnoreInvalid(inputs: Input[]): Output[] {
    return inputs.reduce((result: Output[], input: Input) => {
      try {
        result.push(this.convert(input));
      } catch {
        // Skip invalid input
      }
      return result;
    }, []);
  }
}
