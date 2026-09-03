# Identity

## Map

| Identity                       | Owner                           |
| ------------------------------ | ------------------------------- |
| framework/product/organization | authoritative identity contract |
| user-visible text              | identity/localization owner     |
| deployment address/topology    | infrastructure                  |
| external identifier            | owning integration              |
| generic test/example identity  | neutral test/example fixture    |

## Shape

```text
generic fixture         -> Test application / example.com / business-api
authoritative identity  -> real framework/product name
```

## Rules

- One mutable global identity has one authoritative owner.
- Generic code, fixtures and reusable rules use neutral long-lived names.
- External identifiers stay with the integration that owns them.
