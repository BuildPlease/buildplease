# Constructors

- Store injected dependencies and input values in the constructor.
- Close a constructor with one private `init()` when synchronous initialization has multiple steps.
- Keep the initialization flow behind `init()`.
- Expose asynchronous resource startup through `start()`.

```ts
class Router {
  public constructor(private readonly configuration: Configuration) {
    this.init();
  }

  private init(): void {
    this.configureRoutes();
    this.registerListeners();
  }
}
```

```ts
class Worker {
  public constructor(private readonly queue: Queue) {}

  public async start(): Promise<void> {
    await this.queue.connect();
  }
}
```
