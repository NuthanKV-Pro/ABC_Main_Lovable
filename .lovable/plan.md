

## Plan: Expand Cross-Tool Data Sync with Individual Override

### Current State
- **10 tools** already use `useAutoPopulate` hook (Budget, DTI, Home Affordability, Home Loan, Emergency Fund, FIRE, Retirement, Insurance Premium, TDS, Tax Audit)
- The hook reads from `localStorage` with a priority chain: `sync_*` keys > tool-specific keys > profile data
- `AutoPopulateBadge` shows source attribution and allows per-field reset
- PAN sync already works for TDS Calculator and Tax Audit Checker

### What Needs to Happen

**Phase 1: Wire up ~15 more tools to `useAutoPopulate`** with the data points they already use as defaults:

| Tool | Fields to Sync |
|------|---------------|
| NPSCalculator | age |
| InsuranceComparison | age |
| HomeAffordabilityCalculator | age (already has monthlyIncome) |
| PersonalLoanCalculator | monthlyIncome |
| CarLoanCalculator | monthlyIncome |
| EducationLoanCalculator | monthlyIncome |
| GoldLoanCalculator | monthlyIncome |
| NetWorthCalculator | totalInvestments, totalDebt |
| CreditScoreCalculator | monthlyIncome |
| SIPCalculator | monthlySavings |
| GoalBasedSIPCalculator | monthlySavings |
| LoanComparison | monthlyIncome |
| RentVsBuyCalculator | monthlyIncome |
| ITRFilingAssistant | PAN |
| GSTInvoiceGenerator | PAN, name, address |
| FinancialGoalTracker | monthlyIncome, monthlySavings |
| SalaryRestructuring | salaryMonthlyIncome |

**Phase 2: Expand `resolveWithSource` in useAutoPopulate.ts**

Add resolution for new keys:
- `name` and `address` from `user_profile` (for GST Invoice, exports)
- `monthlySavings` from `fhs_monthlySavings` / `sync_monthlySavings`
- `totalInvestments` / `totalDebt` already mapped but need tool wiring

**Phase 3: Profile Settings sync_pan write-through**

In `ProfileSettings.tsx`, when user saves their profile, also write `sync_pan` to localStorage so it takes priority in the auto-populate chain (consistent with other sync_ keys from "Sync All Tools").

### Per-tool pattern (same for each)

1. Import `useAutoPopulate` and `AutoPopulateBadge`
2. Call `useAutoPopulate([{ key: "...", setter, defaultValue }])` after state declarations
3. Add `<AutoPopulateBadge>` next to the relevant input labels
4. User can still type in the field to override — the badge disappears on reset

### No changes needed to:
- The hook's core logic (already handles strings + numbers)
- The `AutoPopulateBadge` component
- The "Sync All Tools" button in MyFinancialProfile

### Estimated scope
- ~17 page files get small additions (3-10 lines each)
- 1 hook file gets 2-3 new key resolutions
- 1 ProfileSettings update for `sync_pan` write-through

