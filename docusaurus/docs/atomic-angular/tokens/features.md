---
title: APP_FEATURES
sidebar_class_name: deprecated
---

:::warning Deprecated
`APP_FEATURES` is deprecated. Use the `general` configuration object from `AppStore` instead.
:::

The `APP_FEATURES` injection token provided application-level feature flags. It has been superseded by the `general` config managed by `AppStore`.

## Token

```typescript
import { APP_FEATURES } from '@sinequa/atomic-angular';
```

| Name | Type | Description |
|------|------|-------------|
| `APP_FEATURES` | `InjectionToken<AppFeatures>` | Injection token for application feature flags. |
