# Cryptography

## Map

| Secret                               | Persisted representation                        |
| ------------------------------------ | ----------------------------------------------- |
| user password                        | Argon2id/password KDF                           |
| short PIN/verification/recovery code | HMAC/keyed construction with application secret |
| high-entropy bearer token            | SHA-256 digest when raw recovery is unnecessary |

## Shape

```text
password      -> Argon2id
6-digit code  -> HMAC(secret, code/context)
256-bit token -> SHA-256 digest
```

## Rules

- Generate secrets with a cryptographically secure RNG.
- Password KDF parameters are deployment-owned.
- Enumerable low-entropy values use keyed protection.
- Use constant-time comparison where applicable.
- Keys/secrets stay outside persisted application data and source control.
- Logs, telemetry and errors exclude credentials, tokens and codes.
- Long-lived key changes use an explicit versioned rotation strategy.
