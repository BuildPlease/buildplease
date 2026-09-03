# Localization

## Map

| Concept | Meaning                                     |
| ------- | ------------------------------------------- |
| L10n    | authored locale data + typed resources/keys |
| I18n    | runtime translation/integration             |

## Shape

```text
locale source -> L10nResource -> typed L10n keys -> I18n runtime
```

Owner-local source:

```text
src/l10n/locales/
src-neutral/l10n/locales/
<runtime-owner>/l10n/locales/
```

Extension:

```ts
export const L10nResource = BaseL10nResource.extend({
  resources: ApplicationL10n,
});

export const L10n = defineL10n(L10nResource);
```

## Rules

- Locale files are static build inputs owned by their source layer.
- Shared layers own shared content; upper layers extend with only their own content.
- Supported locale codes/mappings stay explicit at their owning boundary.
- `Resources` is reserved for physical runtime assets.
