# TypeScript

- Use strict types, narrow interfaces and discriminated unions.
- Use `import type` for type-only imports.
- Declare return types on public async functions.
- Mark injected dependencies `private readonly`.
- Keep public API types, domain models, transport models and persistence records separate.
- Use explicit object properties when mapping across boundaries.
- Prefer exhaustive `switch` statements for closed unions.
- Use `unknown` at untrusted boundaries and narrow it before use.

```ts
return {
  result: result,
  metadata: metadata,
};
```

Do not hide problems with:

```ts
as any
as unknown as SomeType
// @ts-ignore
// @ts-expect-error
value!
```

An isolated cast is allowed only at a verified boundary whose type system cannot express the runtime contract.

## Canonical type ownership

- Import a contract directly from the package or module that owns it.
- Forwarding re-exports whose only purpose is to mirror a symbol owned elsewhere are forbidden.
- Identity type aliases that only rename an existing type without adding a new semantic contract are forbidden.
- Barrel files may export symbols that are actually owned by that package or module.

Bad:

```ts
export type { DeviceModel } from '@scope/contracts';
export type Cacheable = JSONValue;
```

Good:

```ts
import type { DeviceModel, JSONValue } from '@scope/contracts';
```

## Dependency Injection

- Inject services through canonical named contracts.
- Prefer a narrow named capability when a consumer needs only one part of a larger service.
- Do not reshape injected services with inline `Pick` or `Omit`.
- Utility types remain valid for real data projections.

```ts
// Good
private readonly configuration: StorageConfigurationController;

// Avoid
private readonly configuration: Pick<ConfigurationController, 'storage'>;
```

## Generated code

- Do not manually restyle or refactor generated sources.
- Generated code may contain generator-required casts or suppression comments.
- Fix generated output through its source contract, generator configuration or template.
- Exclude generated folders from handwritten-code quality assertions where appropriate.
