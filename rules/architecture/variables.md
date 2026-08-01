# Variables and functions

- Use `const` and `let` for values and mutable state.
- Prefer function declarations for reusable named functions and test helpers.
- Use arrow functions for callbacks, closures and values that intentionally capture lexical context.
- Do not mechanically replace mock functions or inline callbacks with declarations when they are clearer as values.

```ts
function makeController(): Controller {
  return new Controller();
}

const result = items.map((item) => item.value);
const handler = vi.fn(async () => undefined);
```
