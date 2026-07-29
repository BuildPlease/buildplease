# Configuration

- Keep application-wide limits, intervals, feature behavior, and runtime settings in typed configuration.
- Keep environment-specific values explicit at the configuration boundary.
- Validate external configuration input once during startup or configuration loading.
- Resolve defaults before values enter runtime code.
- Runtime consumers should not repeatedly handle optional values when the configuration contract already provides defaults.
- Environment variables are deployment input, not a general settings store.
- Keep loading, validation, resolution, and runtime consumption as separate responsibilities.
- Build-time configuration must not depend on artifacts produced by the same build step.
- When runtime identity must describe a specific build, load the persisted build metadata instead of recreating it at startup.
- Resolve paths relative to the component that owns the configuration, not incidental process state.
- Do not pass implementation-owned values through public APIs when the implementation can resolve them itself.

```ts
FeatureConfiguration({
  enabled: from.byEnvironment({
    development: true,
    test: true,
    production: false,
  }),
});
```

Prefer typed configuration capabilities over passing raw environment variables through runtime code.
