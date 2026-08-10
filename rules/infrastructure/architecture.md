# Infrastructure

- Keep topology, non-secret configuration and secrets as separate concerns.
- Infrastructure is the source of truth for deployment topology.
- Templates render explicit inputs; orchestration coordinates steps.
- Generated runtime configuration must match the consuming application's typed configuration contract.
- Resolve an explicit target before destructive operations.
- Do not duplicate application defaults in infrastructure unless deployment owns that value.
- Keep deployment scripts deterministic and fail fast on missing required input.
- Prefer calling project scripts over duplicating build or release logic in CI configuration.
