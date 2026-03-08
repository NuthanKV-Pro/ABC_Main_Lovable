

## Plan: My Financial Profile & Quick Summary for Special Tools

### Overview
Create two new pages in Special Tools: (1) **My Financial Profile** — a read-only dashboard aggregating all localStorage data into one snapshot, and (2) **Quick Summary** — a compact widget page showing key numbers at a glance. Both pull from existing localStorage keys with no re-entry needed.

### 1. Create `src/pages/MyFinancialProfile.tsx`

A comprehensive read-only dashboard that aggregates all existing localStorage data into sections:

- **Income Overview**: Read `salary_total`, `hp_total`, `pgbp_total`, `cg_total`, `os_total`, `deductions_total` via `useTaxData` hook. Show gross total, deductions, taxable income.
- **Tax Liability**: Compute old/new regime tax using existing slab logic (from `TotalIncomeTax.tsx`) and show which is better.
- **Financial Health**: Read `fhs_*` keys — show monthly income, expenses, savings rate, DTI ratio, emergency fund months, insurance coverage multiple.
- **Investments & Net Worth**: Read `fhs_totalInvestments`, `fhs_retirementCorpus`. Show investment-to-income ratio and retirement progress.
- **Loans & Debt**: Read `fhs_totalDebt`, `fhs_monthlyDebtPayment`. Show total debt and DTI.
- **Empty State**: If no data found, show a friendly prompt with links to key tools (Salary, Financial Health Score, etc.) to get started.

UI: Card-based layout with sections, icons, and color-coded indicators. Uses existing `useTaxData` hook plus direct `fhs_*` reads.

### 2. Create `src/pages/QuickSummary.tsx`

A compact single-page view showing 4-6 key metric cards:

- **Taxable Income** (from `useTaxData`)
- **Estimated Tax** (computed using slab logic, showing better regime)
- **Savings Rate** (from `fhs_monthlySavings / fhs_monthlyIncome`)
- **Net Worth Estimate** (`fhs_totalInvestments - fhs_totalDebt`)
- **Emergency Readiness** (`fhs_emergencyFund / fhs_monthlyExpenses` months)
- **FIRE Progress** (`fhs_retirementCorpus / (monthlyExpenses * 12 * 25)` percentage)

Each card links to the relevant detailed tool. Minimal layout, large numbers, sparkline-style indicators.

### 3. Update `src/pages/Index.tsx`

Add two new entries to the Special Tools section:
- **My Financial Profile** — icon: `User`/`LayoutDashboard`, route: `/my-financial-profile`
- **Quick Summary** — icon: `Gauge`/`Activity`, route: `/quick-summary`

### 4. Update `src/App.tsx` and `src/lib/routeConfig.ts`

Add routes for both new pages.

### Files Changed
- **Create** `src/pages/MyFinancialProfile.tsx`
- **Create** `src/pages/QuickSummary.tsx`
- **Edit** `src/pages/Index.tsx` (add 2 tool cards)
- **Edit** `src/App.tsx` (add 2 routes)
- **Edit** `src/lib/routeConfig.ts` (add 2 entries)

