

## Plan: Fix Profile Settings Breadcrumb to Be App-Level

The breadcrumb shows "Home > Prototypes > Tax Dashboard > Profile Settings" because `/profile` has `parent: "/dashboard"` in the route config. Since Profile Settings is app-wide, its parent should be `/prototypes`.

### Change

**`src/lib/routeConfig.ts` (line 23)**
- Change `parent: "/dashboard"` → `parent: "/prototypes"`

This makes the breadcrumb show "Home > Prototypes > Profile Settings" and the back button navigate to `/prototypes` instead of the Tax Dashboard.

### Files Changed (1)
- `src/lib/routeConfig.ts`

