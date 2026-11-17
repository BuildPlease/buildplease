# @buildplease/core

Shared, runtime-neutral fundamentals for BuildPlease packages. Core owns common
contracts and utilities (including the `Build` name/version contract), DI,
formatting and framework-independent Node/browser helpers.

```bash
pnpm add @buildplease/core
```

The public entrypoints are `@buildplease/core`, `@buildplease/core/node`,
`@buildplease/core/browser` and `@buildplease/core/test`.

Core does **not** own an application configuration engine or a CLI. Backend
application configuration and the `apikit` executable belong to
`@buildplease/apikit`. WebKit's web configuration is designed independently.

## License

MIT
