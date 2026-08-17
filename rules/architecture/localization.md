# Localization

```text
owned locale files -> L10nResource composition -> L10n typed keys -> I18n runtime
```

- `L10n` names localization content: authored locale data, typed resources and typed key trees.
- `I18n` names the runtime mechanism: services, configuration, adapters, i18next and Vue I18n integration.
- Keep owner-local localization source under `src/l10n/`; authored locale files live under `src/l10n/locales/`.
- Nested runtime/module owners may colocate localization under their own source root, for example `src/runtime/l10n/`.
- Import locale files statically into L10n composition; they are build inputs.
- Expose the owner-local entry point through one exact `#l10n` alias when a project alias is useful.
- Shared/reusable layers own content reused by consumers.
- Compose lower-layer content through `L10nResource`; each layer adds only content it owns.
- Build `L10n` typed keys from the composed resource.
- Supply the final `L10nResource.resources` to the I18n runtime.
- Keep locale codes/mappings explicit at the boundary that owns supported locales.
- Keep localization keys semantic and stable.
- Keep framework-specific I18n types at framework boundaries; runtime-neutral L10n contracts stay framework-neutral.

GOOD:

```ts
export const L10nResource = BaseL10nResource.extend({
  resources: ApplicationL10n,
});

export const L10n = defineL10n(L10nResource);
```

Use `Resources` only for physical runtime assets; localization is compiled source content.
