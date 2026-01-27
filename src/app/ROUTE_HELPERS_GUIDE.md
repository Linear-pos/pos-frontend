# Route Helpers Usage Guide

## Overview
The `routeHelpers.tsx` utilities are available for eliminating boilerplate in route definitions. Use them when creating new routes or refactoring existing ones incrementally.

## Available Functions

### createLazyRoute()
Creates a standard route with lazy loading, error boundary, and suspense.

```typescript
createLazyRoute(
  "path",
  () => import("../features/example/Component"),
  "Display Name"
)
```

### createLazyIndexRoute()
Creates an index route (no path) with lazy loading.

```typescript
createLazyIndexRoute(
  () => import("../features/example/Component"),
  "Display Name"
)
```

### createRoutes()
Creates multiple routes from an array.

```typescript
createRoutes([
  { path: 'overview', import: () => import('../features/dashboard/Overview'), name: 'Overview' },
  { path: 'sales', import: () => import('../features/sales/Sales'), name: 'Sales' },
])
```

## Migration Strategy
- Apply to new routes immediately
- Refactor existing routes opportunistically
- Full migration deferred to avoid breaking changes
