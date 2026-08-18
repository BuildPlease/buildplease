# Testing

Tests protect important behavior at the layer that owns it.

- Prefer a few high-value tests over broad coverage or duplicated cases.
- Keep tests fast, deterministic, isolated and explicit.
- Test observable behavior and public contracts, not private implementation or trivial code.
- Prefer unit and in-process tests; use filesystem, process or network integration only when that boundary matters.
- Cover meaningful success, failure and boundary behavior without testing every permutation.
- Use configured source aliases in tests and test aliases for shared fixtures/helpers; avoid fragile relative traversal imports.
- Do not test framework/typechecker behavior or increase timeouts to hide slow or flaky tests.
- Test count and coverage percentage are not goals; keep justified exceptions local and explicit.

GOOD:

```ts
it('rolls back the transaction when the operation throws', async () => {
  // arrange
  // act
  // assert observable state
});
```

BAD:

```text
duplicate behavior already covered by the owning test
trivial re-export or implementation-detail tests
large mocks that reproduce a dependency or framework
timeouts increased to hide slow or flaky tests
production API exposed only to reach private code from a test
```
