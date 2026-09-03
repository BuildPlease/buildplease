declare global {
  interface String {
    capitalized(): string;
  }
}

String.prototype.capitalized = function (): string {
  const value = this != null ? this.toString() : '';
  if (!value.trim()) return '';

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export {};
