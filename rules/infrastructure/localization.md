# Localization

Localization follows ownership.

- `I18n` names the internationalization mechanism: runtime services, adapters, configuration and framework integrations such as i18next and Vue I18n.
- `L10n` names localization content: authored locale data, typed localization resources and localization key trees.
- Keep owner-level L10n beside `src` under root `l10n/`; authored locale files live in `l10n/locales`.
- Import locale files statically into `L10nResource`; locale files are build inputs, not runtime filesystem resources.
- Keep L10n content out of `Resources`; `Resources` is reserved for physical runtime assets.
- Shared/reusable layers own localization reused by multiple consumers.
- Compose owned L10n sets instead of copying or mirroring keys into higher layers.
- I18n runtime adapters consume the final composed `L10nResource.resources`.
- Do not repeat product or framework identity in copy when the surrounding context already establishes it.
- Keep locale codes and mappings explicit at the boundary that owns them.
- Keep localization keys stable and semantic.
