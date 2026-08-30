# Imports

Use aliases by source and resolution class.

```text
@/*             src/*
@src-name/*    src-name/*

#name         exact semantic, special, runtime or framework alias
#name/*       semantic, non-source-root, runtime or framework namespace
```

Examples:

```text
src/*            -> @/*
src-cli/*        -> @src-cli/*
src-internal/*   -> @src-internal/*
src-node/*       -> @src-node/*
src-test/*       -> @src-test/*

src/l10n/index.ts  -> #l10n
resources/index.ts -> #resources
test/*             -> #test/*
```

If a `src-<name>` root exists, expose it consistently as `@src-<name>/*`.

Exact shortcuts such as `#l10n` and `#resources` are project-owned conveniences, not source-root aliases.

Prefer framework-native aliases where a framework already owns resolution. Keep framework, runtime and module aliases such as `#app`, `#imports`, `#ui`, `#nuxtkit`, `#internal-runtime` and `#internal-shared` unchanged and never shadow them. A framework-native project-root alias such as Nuxt's `@@/*` may be used where that framework owns it; BuildPlease does not define a generic `@@` alias.

Use real package names across package boundaries. Inside the owning package, use its source aliases or a clear relative import.

TypeScript, build and test resolvers must agree. Distributable output must not contain unresolved source-only aliases.
