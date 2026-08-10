# Bundling

- Treat the package manifest as the source of truth for dependency ownership.
- Derive external and bundled dependency policy from the manifest; do not duplicate package names in bundler configuration.
- Use repository-provided dependency/bundling policy helpers when available instead of maintaining parallel external/bundle lists.
- Hardcoded dependency names in bundler configuration require a verified technical exception that cannot be expressed through manifest-derived policy; keep the exception local and documented.
- Derive the current package name from its manifest when build or test tooling needs it; do not hardcode the package name in its own tooling configuration.
- Keep public package imports as package imports in built output when they represent runtime/package boundaries.
- Source aliases are for source compilation, tests and tooling; do not use them to leak package internals to consumers.
- Build, typecheck and test tasks must not require stale generated output to resolve the package's own source.
- Do not use generated build output as source input unless the build pipeline explicitly owns that generated contract.
- Prefer explicit bundler configuration over implicit resolution behavior or environment-dependent defaults.
