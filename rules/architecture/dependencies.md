# Dependencies

- Declare external dependencies with exact versions unless a version range is part of the intended public contract.
- Use the repository workspace protocol for workspace-owned packages.
- Keep dependencies in the manifest of the project that owns the usage.
- Use workspace overrides only for verified transitive incompatibilities or temporary workarounds.
- Keep temporary overrides documented and remove them when upstream is fixed.
- Do not add a dependency for behavior already provided by the codebase or an existing dependency without a concrete reason.
