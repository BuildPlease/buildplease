# Package Architecture

Packages own reusable mechanisms and stable public contracts.

```text
applications = product/domain composition
packages     = reusable mechanisms + stable shared contracts
```

A package may be technology-specific. Technology-specific is not application-specific.

- Keep reusable mechanisms independent of one consumer application.
- Keep generic registries, providers, and factories generic across registered resources.
- Keep package public APIs small and explicit.
- Treat removal or narrowing of an intentional public contract as an API design change.
- Keep implementation-only helpers in the package-private source area.
- Do not export something only because tests or another internal module need it.
- Do not move application workflows into packages merely to remove temporary duplication.
- Callers should provide values they own; implementation-owned details stay inside the package.

Before adding an abstraction ask:

> Can another consumer use this mechanism without knowing the original consumer's domain?

Before adding a public input ask:

> Does the caller own this value?
