

## Plan: Replace `window.confirm` with AlertDialog for Reset Actions

### Approach
Create a reusable `ResetConfirmDialog` component that wraps the shadcn `AlertDialog`. Then replace all 19 occurrences of `window.confirm("Reset all data in this tool?")` with this component.

### New Component: `src/components/ResetConfirmDialog.tsx`
A small wrapper around `AlertDialog` that:
- Accepts `onConfirm` callback and an optional `trigger` (defaults to `RotateCcw` icon button)
- Renders AlertDialog with title "Reset all data?", description "This will clear all saved data in this tool. This action cannot be undone.", and Cancel/Reset buttons
- Uses destructive variant for the Reset action button

### Changes to 19 Files
Replace the inline `window.confirm` + reset logic pattern with:
```tsx
<ResetConfirmDialog onConfirm={handleReset} />
```

Extract each tool's reset logic into a named `handleReset` function (where not already done), and replace the `<Button variant="ghost" size="icon" onClick={...}>` block with the `ResetConfirmDialog` component.

**Files to update:**
1. `Salary.tsx` — wrap existing `handleClearForm`
2. `Deductions.tsx`
3. `HouseProperty.tsx`
4. `CapitalGains.tsx`
5. `BusinessProfession.tsx`
6. `OtherSources.tsx`
7. `FinancialHealthScore.tsx` — wrap existing `handleReset`
8. `BudgetPlanner.tsx`
9. `FIRECalculator.tsx`
10. `RetirementCalculator.tsx`
11. `EmergencyFundCalculator.tsx`
12. `NetWorthCalculator.tsx`
13. `SIPCalculator.tsx`
14. `EMICalculator.tsx`
15. `WeddingBudgetPlanner.tsx`
16. `HUFTaxPlanner.tsx`
17. `ComplianceCalendar.tsx`
18. `FinancialStatements.tsx`
19. `FinancialRatios.tsx`
20. `GSTInvoiceGenerator.tsx`

### Files Changed (21 total)
- **Create** `src/components/ResetConfirmDialog.tsx`
- **Edit** 20 page files — replace `window.confirm` with `<ResetConfirmDialog>`

