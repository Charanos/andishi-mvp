# Currency Refactor Guide

_Last updated: 2025-07-31_

This document explains **why** we introduced a shared currency utility and **how** to migrate every part of the code-base to the new model without breaking existing functionality.

---

## 1. Motivation

1. Currency values were previously returned as plain numbers (sometimes USD, sometimes KES) which led to:
   - Silent unit mismatches.
   - `NaN` in the UI when complex objects leaked to the frontend.
2. Users must see both USD equivalents **and** original KES values where relevant.
3. We need _one_ place to format, extract, and manipulate money to avoid duplication / drift.

---

## 2. The new `CurrencyAmount` model

````typescript
export interface CurrencyAmount {
  amount: number;               // Value in `currency`
  currency: 'USD' | 'KES';      // Primary currency of `amount`
  usdEquivalent?: number;       // Convenience: converted to USD
  originalAmount?: number;      // Raw value before backend conversion
  originalCurrency?: 'USD' | 'KES';
}
````

> NOTE:  In most cases **`usdEquivalent`** will be the field you graph or aggregate so dashboards stay on a single scale.

---

## 3. Shared helper functions (located in `utils/currency.ts`)

Function | Purpose
---------|---------
`extractAmount(value)` | Always returns a **number** (prefers `usdEquivalent` → `amount`). Use in charts.
`getCurrencySymbol(value)` | Returns `'USD'`/`'KES'` (assumes `USD` for primitive numbers).
`formatNumber(num)` | Adds thousands separators, no currency symbol.
`formatCurrency(value, showOriginal?)` | Formats as `$12,345` or `$13,860 (KES 1,800,000)` when `showOriginal` is `true` and value was originally KES.

Import example:
```ts
import { CurrencyAmount, extractAmount, formatCurrency } from "@/utils/currency";
```

---

## 4. Migration checklist

1. **Delete** any locally-defined `formatCurrency`, `extractAmount`, etc. in TSX / TS files.
2. **Import** from `@/utils/currency` instead.
3. Replace direct usages of:
   ```ts
   amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
   ```
   with
   ```ts
   formatCurrency(amount)
   ```
4. For charts (Recharts, Victory, etc.):
   ```ts
   const numeric = extractAmount(dataPoint.revenue);
   ```
5. When you need to show both currencies (e.g. tooltips, tables), pass `showOriginal = true`:
   ```tsx
   <span>{formatCurrency(project.budget, true)}</span>
   ```
6. **Remove** hard-coded exchange logic from the frontend—the backend sets `usdEquivalent`.
7. Run `tsc` to ensure no duplicate identifier errors remain.

---

## 5. Common pitfalls

| Problem | Fix |
|---------|-----|
| `NaN` in UI | Ensure the value passed to chart/formatter isn’t the raw object—use `extractAmount`. |
| Duplicate `CurrencyAmount` interface | Delete local interface and import from util. |
| Currency symbol always `$` | Always format through `formatCurrency`; do not use `toLocaleString` directly. |

---

## 6. Testing strategy

### Unit tests (Jest)
- `utils/currency.test.ts` – covers edge cases for each helper.

### Integration tests (React Testing Library)
1. Render dashboard metric card with a mock `CurrencyAmount` (KES origin → USD).
2. Assert that `$13,860 (KES 1,800,000)` appears.

### End-to-end tests (Cypress / Playwright)
- Navigate to Admin > Analytics; verify no `NaN` text exists and totals match backend fixture.

---

## 7. Roll-out plan

1. Merge `utils/currency.ts`.
2. Refactor `app/admin-dashboard/renderAnalytics.tsx` _(done)._ ✅
3. Refactor remaining files (`page.tsx`, `ProjectOverview.tsx`, etc.).
4. Run full test suite & fix type errors.
5. Deploy to staging for product acceptance.

---

## 8. Further improvements

- Extract exchange rates to a shared config / API.
- Consider using a well-tested money library (e.g. Dinero.js) if requirements grow.

---

**Happy refactoring!**
