# Bundling

- Treat `package.json` as the source of truth for dependency ownership.
- Derive external/bundled dependency policy from the manifest through repository helpers when available.
- Derive the current package name from its manifest when tooling needs it.
- Preserve public package boundaries as package imports in emitted code.
- Use source aliases for source, tests and tooling; consumers use public package exports.
- Build, typecheck and test resolve current source without relying on stale output from the same project.
- Generated output becomes build input only when the pipeline explicitly owns that generated contract.
- Keep bundler configuration deterministic and independent of incidental process state.
- Copy physical runtime resources as assets; compile source registries as source code.

GOOD:

```text
package.json -> bundling policy helper -> tsdown externals
```

BAD:

```text
package.json dependency list
+ manually duplicated hardcoded bundler dependency list
```

A hardcoded bundler exception is local, documented and tied to a verified technical constraint.
