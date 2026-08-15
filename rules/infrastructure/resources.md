# Resources

`Resources` is the owner-local registry for physical assets that must remain available at runtime.

- Keep runtime assets under the owning root `resources/` directory.
- Keep the registry at `resources/index.ts`, including when currently empty.
- A `Resources` registry contains only resources owned by that unit.
- Keep raw `resources/` in package output when runtime consumers need physical files.
- Keep L10n out of `Resources`; localization content belongs to root `l10n/` and is statically imported into `L10nResource`.
- Do not inherit or spread another package's `Resources` registry.
