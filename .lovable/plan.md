

## Plan: Expand Smart Action Plan with More FHS-Driven Recommendations

### Current State
The Smart Action Plan already reads `fhs_*` localStorage keys but several checks are gated on `salary.total > 0`, meaning they won't fire if the user only filled in the Financial Health Score. Additionally, several FHS dimensions aren't being used at all.

### New Recommendations to Add (in `generateActions` in `SmartActionPlan.tsx`)

1. **Low Savings Rate** — If `monthlySavings / monthlyIncome < 20%`, recommend improving savings rate → link to `/budget-planner`. High priority if < 10%.

2. **High Expense Ratio** — If `monthlyExpenses / monthlyIncome > 70%`, warn about overspending → link to `/budget-planner`.

3. **Low Investment Diversification** — If `totalInvestments < monthlyIncome * 6` and age > 25, suggest starting/growing investments → link to `/sip-calculator`.

4. **Insurance Coverage (FHS-only path)** — Remove the `salary.total > 0` gate on the existing insurance check so it also works with FHS `monthlyIncome * 12` as annual income fallback.

5. **Retirement Readiness (FHS-only path)** — Similarly, allow retirement check to use `monthlyIncome * 12` when `salary.total` is 0.

6. **Debt Exceeds Annual Income** — If `totalDebt > monthlyIncome * 12`, flag total debt burden → link to `/loan-comparison`.

7. **No Financial Health Score Data** — If FHS data exists but score wasn't calculated, nudge user to complete it → link to `/financial-health-score`.

### Technical Changes

**Single file edit: `src/pages/SmartActionPlan.tsx`**
- Read `fhs_totalInvestments` and `fhs_monthlySavings` (currently not read)
- Add 4 new recommendation blocks after existing ones
- Relax `salary.total > 0` gates on insurance/retirement to also use `monthlyIncome * 12` as fallback
- Add `BarChart3` or `Percent` icon import from lucide-react

