# Cryptography

Choose secret storage from entropy, recoverability and threat model.

| Secret | Preferred persisted representation |
| ------ | ---------------------------------- |
| User password | password KDF such as Argon2id |
| Short verification/PIN/recovery code | keyed construction such as HMAC with an application secret |
| High-entropy random bearer token | SHA-256 digest when raw token recovery is unnecessary |

- Generate secrets with a cryptographically secure RNG.
- Use password-specific KDF parameters appropriate to the deployment environment.
- Use keyed protection for enumerable low-entropy secrets so a database dump alone cannot validate guesses.
- Store only the digest of sufficiently random bearer tokens when the raw token is needed only by the client.
- Compare secret-derived values with constant-time primitives where applicable.
- Keep cryptographic keys/secrets outside persisted application data and source control.
- Keep raw credentials/tokens/codes out of logs, telemetry and error payloads.
- Rotate keys through an explicit versioned operational strategy when long-lived encrypted/signed data requires it.

GOOD:

```text
password -> Argon2id hash
6-digit code -> HMAC(app secret, code/context)
256-bit bearer token -> SHA-256 digest
```

BAD:

```text
password -> SHA-256
6-digit code -> plain SHA-256
raw bearer token -> database/log entry
```
