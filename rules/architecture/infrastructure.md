# Infrastructure

## Map

| Concern                          | Owner                     |
| -------------------------------- | ------------------------- |
| deployment topology              | infrastructure            |
| runtime services/network/storage | infrastructure            |
| secrets delivery                 | infrastructure            |
| application defaults/behavior    | application configuration |
| migrations/repair                | explicit mutation task    |
| health checks                    | read-only health boundary |

## Shape

```text
CI -> repository script -> build/release tooling

explicit deployment input
  -> rendered runtime configuration
  -> application
```

## Rules

- Infrastructure operations are deterministic and idempotent.
- Destructive operations resolve an explicit target first.
- Secrets, non-secret configuration and topology stay separate.
