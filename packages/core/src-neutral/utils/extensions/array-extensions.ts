declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Array<T> {
    /**
     * Checks if the array is empty or undefined or null.
     * @returns `true` if the array is empty, undefined, or null; otherwise `false`.
     */
    isEmpty(): boolean;
  }
}

Array.prototype.isEmpty = function (): boolean {
  return this == null || this.length === 0;
};

export {};
