# Testing

Tests protect behavior at the layer that owns it.

## Priority

1. Public contracts and reusable behavior.
2. Security, transactions, resource lifecycle and concurrency-sensitive behavior.
3. Configuration parsing, validation and resolution.
4. Complex application/domain branching.
5. Transport adaptation.
6. Simple mapping when the mapping itself is a public contract.

## Test shape

- Write one test around one observable behavior.
- Name tests after behavior.
- Cover meaningful success, expected failure and boundary conditions.
- Test behavior once at its owner; consumers test their own integration/composition.
- Protect pure type behavior primarily with strict typecheck and focused type assertions when needed.
- Use integration tests where generated/runtime/framework interaction is the contract.
- Prefer deterministic fixtures and temporary resources.
- Keep fixture builders local until reuse is real.
- Keep test doubles smaller than the behavior under test.
- Verify interactions when the interaction itself is the protected side effect.
- Use production source aliases in tests.
- Keep private implementation private and test observable behavior through its owning boundary.

```ts
it('rolls back the transaction when the operation throws', async () => {
  // arrange
  // act
  // assert observable state
});
```

| Behavior                            | Preferred protection       |
| ----------------------------------- | -------------------------- |
| Value object / converter            | Unit test                  |
| Configuration parsing               | Unit test                  |
| Lifecycle / deterministic algorithm | Unit test                  |
| Runtime/framework integration       | Integration test           |
| Pure type mapping                   | Typecheck / type assertion |

BAD:

```text
consumer retests framework/package behavior already owned by the dependency
re-export file test with no behavior
test that reproduces an entire third-party framework as mocks
public production API added only to reach a private helper from a test
```
