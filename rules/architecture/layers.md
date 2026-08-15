# Layers and Ownership

Organize code by ownership and dependency direction.

```text
Transport -> Application operation -> Domain capability -> External adapter
```

- Transport adapts external input/output.
- Application operations coordinate one behavior and its dependencies.
- Domain code owns stable business rules and contracts.
- Adapters own persistence, network, filesystem and framework integration.
- Composition roots may know concrete implementations.
- Cross-module collaboration uses the owning module's public boundary.
- Dependencies point toward stable contracts; concrete integration stays at the edge.

## Applications

Typical modular application:

```text
src/app/                  composition and runtime startup
src/library/              application-local reusable technical capabilities
src/modules/<name>/api/   public module contracts
src/modules/<name>/impl/  private module implementation
src/l10n/                 owner-local localization source
```

- `api/` contains contracts intentionally shared with other modules.
- `impl/` contains module-owned implementation.
- `library/` contains reusable code that still belongs to the application.
- Application-specific workflows remain in the application.

## Packages

Typical package:

```text
src/          public contracts and public implementations
src-internal/ package-private implementation
src-node/     Node-only public surface when required
src-cli/      CLI entry points when required
test/         behavioral tests
types/        ambient/package declarations when required
resources/    physical runtime assets + registry
```

- Packages own reusable mechanisms and stable shared contracts.
- Technology-specific packages are valid; consumer-specific workflows stay with the consumer.
- Public exports are small, explicit and consumer-driven.
- Implementation helpers stay package-private.
- A caller provides values it owns; implementation-owned details stay inside the implementation.

GOOD:

```text
application -> @scope/package public export -> package implementation
```

BAD:

```text
application -> @scope/package/src-internal/private-helper
```
