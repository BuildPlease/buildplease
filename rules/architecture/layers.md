# Layers

Organize code by ownership and dependency direction, not by convenience.

## Applications

A typical application separates transport, application behavior, domain capabilities and external adapters.

```text
Transport -> Application operation -> Domain capability -> External adapter
```

- Transport adapts external input to application operations.
- Application operations coordinate behavior and dependencies.
- Domain code owns business rules and stable domain contracts.
- External adapters implement persistence, network, filesystem or other infrastructure boundaries.
- Cross-module collaboration goes through the owning module's public boundary.
- A composition root may know concrete implementations; reusable logic should depend on stable contracts.
- Tests may import the implementation they directly test; test imports do not define runtime ownership.

A modular application may use:

```text
src/modules/<name>/api/   public module contracts
src/modules/<name>/impl/  private module implementation
src/library/              app-local reusable technical capabilities
src/app/                  composition root and runtime startup
```

## Packages

A package may use:

```text
src/          public contracts and public implementations
src-internal/ package-private implementation details and tooling
src-node/     Node-only public surface when needed
src-cli/      command entry points when needed
test/         behavioral tests
types/        ambient or package-level declarations when needed
```

- Keep the public surface limited to contracts and behavior consumers actually need.
- Keep implementation-only helpers behind the package boundary.
- Package internals may depend on package public contracts.
- Consumers must not import package-private source paths.

Keep dependencies pointing inward toward stable contracts.
