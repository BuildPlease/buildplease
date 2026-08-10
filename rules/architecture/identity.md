# Identity

Mutable global identity must have one authoritative owner.

- Do not duplicate product, framework, organization or brand identity across unrelated code.
- Do not include identity merely for decoration or repetition.
- Generic code, tests, fixtures, examples, sample environment values, comments and reusable rules should use neutral, long-lived names and domains.
- Prefer stable architectural names over mutable identity for generic types, reusable modules and private workspace package names.
- User-visible identity should come from the owning identity contract or localization layer when identity is semantically required.
- Do not reconstruct deployment topology from product or framework identity; infrastructure owns deployment topology.
- Do not centralize values that are not actually identity merely to remove every repeated string.

Examples:

Bad:

```text
MyApp tests
MyApp Event
https://cdn-test.myapp.com
@myapp/business-api
```

Good:

```text
Test application
Test Event
https://cdn.example.com
business-api
```

Identity-specific literals are allowed when they are the actual subject or contract, including:

- authoritative identity definitions;
- concrete external or persistent systems;
- infrastructure records;
- externally required identifiers;
- public package/module namespaces;
- user-visible branding where identity carries meaning.

Keep exceptions local. Do not propagate them into unrelated layers.
