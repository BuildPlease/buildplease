# Localization

Localization follows ownership.

- Every reusable message has one authoritative owner at the lowest layer that semantically owns it.
- Shared/reusable layers own messages reused by multiple consumers; applications own only application-specific messages.
- Compose owned resource sets instead of copying or mirroring keys into higher layers.
- Do not repeat product or framework identity in copy when the surrounding context already establishes it.
- Keep locale codes and mappings explicit at the boundary that owns them.
- Framework adapters translate localization contracts into framework runtime behavior; framework types do not leak into runtime-neutral contracts.
- Parity tests belong to the package or module that owns a reusable resource set. Consumers do not repeat parity tests for inherited resources.
- Keep localization keys stable and semantic; do not encode presentation layout or temporary implementation details into key names.
