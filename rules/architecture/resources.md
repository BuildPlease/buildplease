# Resources

`Resources` is the owner-local registry for physical assets that remain available at runtime.

```text
resources/index.ts  source registry
resources/**        physical runtime assets
src/l10n/**         compiled localization source
```

- Keep physical runtime assets under the owner's root `resources/` directory.
- Keep the registry at `resources/index.ts`, including when currently empty.
- Expose the registry through one exact `#resources` alias when a project alias is useful.
- Keep each registry limited to assets owned by that unit.
- Resolve asset paths relative to the registry with `import.meta.url`/owner-relative path helpers.
- Keep raw `resources/` in package files when the package reserves or publishes runtime assets.
- For tsdown-built owners, copy physical assets into `dist/resources` while compiling `resources/index.ts` as source code.
- Keep an empty resource root prepared when the owner intentionally reserves the convention.

GOOD:

```ts
export const Resources = {
  Email: {
    Templates: resolvePath(import.meta.url, 'email/templates'),
  },
  Public: resolvePath(import.meta.url, 'public'),
} as const;
```

GOOD — prepared owner:

```ts
export const Resources = {} as const;
```

GOOD — asset copy shape:

```ts
{
  from: ['resources/**/*', '!resources/index.ts'],
  to: 'dist/resources',
  flatten: false,
}
```

BAD:

```ts
export const Resources = {
  ...SharedResources,
  L10n: resolvePath(root, 'l10n'),
};
```
