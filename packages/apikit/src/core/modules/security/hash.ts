import bcrypt from 'bcrypt';

/**
 * Generates a hash for a given input string.
 *
 * @param input - The input string to hash.
 * @param salt - The number of salt rounds to use. Default is 10.
 * @returns A promise that resolves to the hashed string.
 */
export async function makeHash(
  input: string,
  salt: number = 10,
): Promise<string> {
  return bcrypt.hash(input, salt);
}

/**
 * Compares a candidate string with a hashed string.
 *
 * @param candidate - The candidate string to compare.
 * @param hashed - The hashed string to compare against.
 * @returns A promise that resolves to a boolean indicating if the candidate matches the hash.
 */
export async function compareHash(
  candidate: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, hashed);
}
