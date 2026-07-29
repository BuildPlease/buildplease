# Layers

Organize code by ownership and dependency direction, not by convenience.

## Applications

A typical application separates transport, application behavior, domain capabilities, and external adapters.

```text
Transport -> Application operation -> Domain capability -> External adapter
```

- Transport adapts external input to application operations.
- Application operations coordinate behavior and dependencies.
- Domain code owns business rules and stable domain contracts.
- External adapters implement persistence, network, filesystem, or other infrastructure boundaries.
- Composition roots may know concrete implementations; reusable logic should depend on contracts.

## Packages

A typical package layout may look like:

```text
src/          public contracts and public implementations
src-internal/ package-private implementation details and tooling
src-cli/      command entry points and orchestration
test/         behavioral tests
types/        ambient or package-level declarations
```

- Keep the public surface limited to contracts and behavior consumers actually need.
- Keep implementation-only helpers behind the package boundary.
- Package internals may depend on package public contracts.
- Consumers must not import package-private source paths.
- Tests may import the implementation they directly test; test imports do not define runtime ownership.

Keep dependencies pointing inward toward stable contracts.
