# Composables

Reusable Angular functions ("injectable function" pattern) shared between `src/app` and `src/app2`.

---

## `injectUrlQueryParamsSync`

### Context

Search components (`search-all`) and the assistant (`assistant.layout`) need to synchronize URL query params with the `QueryParamsStore`. This synchronization was duplicated as inline `effect()` calls in each component.

This composable extracts that logic into a single place.

### Mechanism

The Angular router is configured with `withComponentInputBinding()`, which automatically binds URL query params to the component's `input()` signals (e.g. `?q=foo` → `input<string>('q')`).

The composable wires two effects onto these signals:

```
URL (query params)
  │  withComponentInputBinding()
  ▼
input() signals  ──── Effect 1 ──▶  QueryParamsStore.patch()
                                            │
                                            │  Effect 2 (optional)
                                            ▼
                               router.navigate() → URL updated
```

### API

```typescript
function injectUrlQueryParamsSync(
  inputs: UrlQueryParamInputs,
  options?: UrlQueryParamsSyncOptions
): void
```

**`UrlQueryParamInputs`** — all fields are optional:

| Field | Type | Query param |
|-------|------|-------------|
| `q`   | `InputSignal<string \| undefined>` | `?q=` search text |
| `t`   | `InputSignal<string \| undefined>` | `?t=` active tab |
| `b`   | `InputSignal<string \| undefined>` | `?b=` basket |
| `s`   | `InputSignal<string \| undefined>` | `?s=` sort |
| `f`   | `InputSignal<string \| undefined>` | `?f=` filters (serialized JSON) |
| `n`   | `InputSignal<string \| undefined>` | `?n=` query name |
| `c`   | `InputSignal<SpellingCorrectionMode \| undefined>` | `?c=` spell correction |
| `p`   | `InputSignal<number \| undefined>` | `?p=` page number |

**`UrlQueryParamsSyncOptions`**:

| Option      | Type      | Default | Description                                                        |
|-------------|-----------|---------|-------------------------------------------------------------------|
| `syncToUrl` | `boolean` | `true`  | Enables Effect 2 (Store → URL). Set to `false` for one-way sync. |

### Usage

#### Bidirectional — `search-all` and `assistant.layout` (URL ↔ Store)

Both components synchronize bidirectionally: URL changes update the store, and store changes update the URL.

```typescript
export class SearchAllComponent {
  protected readonly q = input<string>();
  protected readonly t = input<string>();
  // ... other inputs

  constructor() {
    injectUrlQueryParamsSync({ q: this.q, t: this.t, b: this.b, s: this.s, f: this.f, n: this.n, c: this.c });
  }
}
```

```typescript
export class AssistantLayoutComponent {
  readonly q = input<string>();
  readonly t = input<string>();
  // ... other inputs

  constructor() {
    injectUrlQueryParamsSync({ q: this.q, t: this.t, b: this.b, s: this.s, f: this.f, n: this.n, c: this.c });

    // React to store changes to update the local query signal
    effect(() => {
      getState(this.queryParamsStore);
      this.query.set(this.queryParamsStore.getQuery());
    });
  }
}
```

#### One-way — URL → Store only (`syncToUrl: false`)

Use this option for components that read search context from the URL but must not write back to it (e.g. an embedded viewer that should not alter the browser history).

```typescript
export class SomeViewerComponent {
  readonly q = input<string>();
  readonly f = input<string>();
  // ... other inputs

  constructor() {
    injectUrlQueryParamsSync(
      { q: this.q, f: this.f },
      { syncToUrl: false }
    );
  }
}
```

### Constraints

- Must be called within an **Angular injection context** (component constructor or field initializer).
- The `input()` signals passed in must be declared as class members of the component for `withComponentInputBinding()` to recognize them.

---

### Why a composable instead of an abstract class?

An alternative considered was to centralize input declarations in an abstract class:

```typescript
// ❌ Rejected alternative
abstract class WithUrlQueryParams {
  protected readonly q = input<string>();
  protected readonly t = input<string>();
  // ... all inputs

  constructor(options?: UrlQueryParamsSyncOptions) {
    injectUrlQueryParamsSync({ q: this.q, ... }, options);
  }
}

class SearchAllComponent extends WithUrlQueryParams {
  constructor() { super(); }
}

class AssistantLayoutComponent extends WithUrlQueryParams {
  constructor() { super(); }
}
```

Technically, Angular Ivy handles `input()` signal inheritance well — `withComponentInputBinding()` scans the prototype chain and discovers them correctly. So the technical constraint is not a blocker.

**The reasons for rejection are architectural:**

**1. Inheritance enforces too broad a contract.**
All components would inherit all inputs (`q`, `t`, `b`, `s`, `f`, `n`, `c`, `p`), including ones they don't need. The assistant doesn't use `p` (pagination), for example. The composable accepts only the inputs the component explicitly declares.

**2. Inheritance hides behavior.**
A developer reading `AssistantLayoutComponent` has to look up the parent class to understand where the inputs come from and why `syncToUrl: false` is passed to `super()`. With the composable, everything is visible in the component constructor.

**3. Angular discourages component inheritance.**
The official documentation explicitly recommends **composition** (directives, services, injectable functions) over inheritance for sharing behavior between components. Inheritance creates structural coupling that is hard to evolve independently.

**4. The actual gain is small.**
The duplication eliminated was in the *effects* (50+ lines per component), not in the input declarations (7 lines). The composable solves the real problem; hiding inputs in a parent class just shifts the complexity elsewhere.
