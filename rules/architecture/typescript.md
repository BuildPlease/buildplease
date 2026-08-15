# TypeScript

## Types

- Use strict TypeScript, narrow contracts and discriminated unions.
- Use `unknown` at untrusted boundaries and narrow before use.
- Use `import type` for type-only imports.
- Declare return types on public async functions.
- Mark injected dependencies `private readonly`.
- Keep public API types, domain models, transport DTOs and persistence rows distinct.
- Prefer exhaustive `switch` handling for closed unions.
- Use explicit object properties when mapping or constructing objects.

GOOD:

```ts
return {
  result: result,
  metadata: metadata,
};
```

BAD:

```ts
return { result, metadata };
```

- Use casts only at verified boundaries where runtime behavior is known but the type system cannot express the contract.

GOOD:

```ts
if (!isConfiguration(value)) throw new Error('Invalid configuration.');
return value;
```

BAD:

```ts
return value as any;
return value as unknown as Configuration;
// @ts-ignore
value!;
```

## Canonical ownership

- Import a contract from the package or module that owns it.
- Re-export symbols that are genuinely owned by the current public surface.
- Create a type alias when it adds a distinct semantic contract.

GOOD:

```ts
import type { DeviceModel, JSONValue } from '@scope/contracts';
```

BAD:

```ts
export type { DeviceModel } from '@scope/contracts';
export type Cacheable = JSONValue;
```

## Dependency injection

- Inject services through canonical named contracts.
- Create a narrow named capability when a consumer needs a stable subset of a larger service.
- Use utility types for real data projections, not ad-hoc service shaping.

GOOD:

```ts
private readonly configuration: StorageConfigurationController;
```

BAD:

```ts
private readonly configuration: Pick<ConfigurationController, 'storage'>;
```

## Variables and functions

- Use `const` by default and `let` for intentional mutation.
- Use function declarations for reusable named functions and test helpers.
- Use arrow functions for callbacks, closures and lexical-context values.

```ts
function makeController(): Controller {
  return new Controller();
}

const result = items.map((item) => item.value);
const handler = vi.fn(async () => undefined);
```

## Construction and lifecycle

- Constructors store dependencies and input state.
- Use one private `init()` to close multi-step synchronous initialization.
- Use `start()` / `stop()` / `quit()` for real asynchronous resource lifecycle.

```ts
class Router {
  public constructor(private readonly configuration: Configuration) {
    this.init();
  }

  private init(): void {
    this.configureRoutes();
    this.registerListeners();
  }
}
```

```ts
class Worker {
  public constructor(private readonly queue: Queue) {}

  public async start(): Promise<void> {
    await this.queue.connect();
  }
}
```

## Generated code

- Treat generated sources as generator output.
- Change generated behavior through its source contract, generator configuration or template.
- Keep generated folders outside handwritten-code style assertions when the generator owns their shape.
