# Testing Strategy

Tests protect behavior that is expensive to rediscover in production.

Priority:

1. Public contracts and reusable behavior.
2. Security, transactions, resource lifecycle, and concurrency-sensitive behavior.
3. Configuration parsing, validation, and resolution.
4. Complex application or domain branching.
5. Transport adaptation.
6. Trivial mapping only when it is itself a public contract.

Do not chase test count or line coverage for its own sake.

## Test shape

Use one test per behavior.

```ts
it('rejects invalid input before starting the resource', async () => {
  // arrange
  // act
  // assert observable state
});
```

- Name tests after behavior, not implementation methods.
- Test success, expected failure, and boundary conditions.
- Verify interactions only when the interaction itself is the side effect being protected.
- Prefer deterministic fixtures.
- Keep fixture builders close to tests until reuse is real.
- Keep test doubles smaller than the behavior under test.
- Use the same source aliases as production code; do not climb through `../../../src`.
- Do not recreate framework or third-party contracts by hand.
- If a test mostly mocks a framework or dependency, move the test boundary or remove the test.
- Never make production code public only to unit-test a private implementation detail.
