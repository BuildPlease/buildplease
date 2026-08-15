# Identity

Mutable global identity has one authoritative owner.

- Keep product, framework, organization and brand identity in the contract that owns it.
- Use neutral long-lived names/domains in generic code, tests, fixtures, examples and reusable rules.
- Use stable architectural names for generic types, reusable modules and private workspace packages.
- Resolve user-visible identity from the owning identity contract or localization layer.
- Let infrastructure own deployment topology and concrete environment addresses.
- Keep externally required identifiers local to the integration that owns them.

GOOD:

```text
Test application
Test Event
https://cdn.example.com
business-api
```

BAD:

```text
MyProduct tests
MyProduct Event
https://cdn-test.myproduct.com
@myproduct/business-api
```

Concrete identity literals are appropriate in authoritative identity definitions, public package namespaces, external system contracts, persistent identifiers and user-visible branding where identity carries meaning.
