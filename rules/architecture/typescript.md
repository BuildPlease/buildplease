# TypeScript

## Map

| Boundary               | Type shape                                |
| ---------------------- | ----------------------------------------- |
| untrusted input        | `unknown` -> validate/narrow              |
| public/domain contract | explicit named type                       |
| closed variants        | discriminated union + exhaustive handling |
| type-only dependency   | `import type`                             |
| public async function  | explicit `Promise<...>` return            |
| injected service       | named contract + `private readonly`       |

| Construct                      | Default              |
| ------------------------------ | -------------------- |
| immutable local                | `const`              |
| intentional mutation           | `let`                |
| reusable named function/helper | function declaration |
| callback/closure               | arrow function       |

## Shape

```text
browser -> neutral + browser
node    -> neutral + node
```

```ts
if (!isConfiguration(value)) throw new Error('Invalid configuration.');
return value;
```

```ts
class StorageService {
  public constructor(private readonly configuration: StorageConfigurationController) {}
}
```

```text
constructor -> store dependencies/input
init()      -> synchronous multi-step setup
start/stop  -> asynchronous resource lifecycle
```

## Rules

- Public API types, domain models, transport DTOs and persistence rows stay distinct.
- Casts live only at verified boundaries where runtime behavior is known and TypeScript cannot express the contract.
- Neutral source passes both browser and Node programs; runtime configs expose only valid aliases/globals.
- Stable service subsets use named capabilities; utility types model data projections.
- Generated source changes through its owning generator/config/template.
