# Configuration

```text
external input -> load -> validate -> resolve defaults -> typed runtime configuration
```

- Keep runtime settings, limits, intervals and feature behavior in typed configuration.
- Keep environment-specific values explicit at the configuration boundary.
- Validate external configuration once during loading/startup.
- Resolve defaults before runtime consumers receive values.
- Separate loading, validation, resolution and consumption.
- Treat environment variables as deployment input; configuration owns their runtime shape.
- Resolve paths relative to the component that owns the configuration.
- Keep build-time configuration independent of output produced by the same build step.
- Keep implementation-owned values inside the implementation when the caller does not own them.

GOOD:

```ts
const Configuration = defineConfiguration({
  timeoutMs: field.number().default(5_000),
});
```

BAD:

```ts
const timeout = Number(process.env.TIMEOUT_MS ?? 5000);
// repeated in multiple runtime consumers
```
