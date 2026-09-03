# Resources

## Map

| Item          | Rule                                            |
| ------------- | ----------------------------------------------- |
| registry      | `resources/index.ts`                            |
| alias         | exact `#resources` when useful                  |
| paths         | owner-relative / `import.meta.url` based        |
| package files | include raw assets when published/runtime-owned |
| tsdown output | copy assets to `dist/resources`                 |
| empty owner   | `export const Resources = {} as const`          |

## Shape

```text
resources/index.ts  source registry
resources/**        physical runtime assets
<source-root>/l10n  compiled localization source
```

```ts
export const Resources = {
  Email: {
    Templates: resolvePath(import.meta.url, 'email/templates'),
  },
  Public: resolvePath(import.meta.url, 'public'),
} as const;
```

## Rules

- `Resources` contains physical assets that must remain available at runtime.
- Each registry contains only assets owned by that unit.
- Localization stays compiled L10n source, not a runtime `Resources` subtree.
