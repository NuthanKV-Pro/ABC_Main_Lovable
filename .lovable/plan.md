

## Plan: Auto-Populate Shared Data Across Tools

### Problem
Many tools ask for the same inputs (monthly income, age, expenses, debt, etc.) forcing users to re-enter data. Data already exists in `localStorage` from other tools.

### Data Source Priority
1. **Tax Dashboard** (`salary_total`, `hp_total`, `os_total` via `useTaxData`)
2. **Financial Health Score** (`fhs_monthlyIncome`, `fhs_age`, `fhs_monthlyExpenses`, `fhs_totalDebt`, `fhs_monthlyDebtPayment`, `fhs_totalInvestments`, `fhs_monthlySavings`, `fhs_insuranceCoverage`, `fhs_retirementCorpus`)
3. **User Profile** (`user_profile` JSON with age, name)

### Auto-Population Mappings

Each tool below will read matching data on mount (only if user hasn't already entered values, i.e. the field is still at its default):

| Tool | Field | Source Key | Logic |
|------|-------|-----------|-------|
| **FinancialHealthScore** | `monthlyIncome` | `salary_total / 12` | Use salary if available, keep existing FHS value otherwise |
| **BudgetPlanner** | `monthlyIncome` | `fhs_monthlyIncome` or `salary_total / 12` | Whichever is available |
| **RetirementCalculator** | `currentAge` | `fhs_age` | |
| **RetirementCalculator** | `monthlyExpenses` | `fhs_monthlyExpenses` | |
| **FIRECalculator** | `age` | `fhs_age` | |
| **FIRECalculator** | `monthlyExp` | `fhs_monthlyExpenses` | |
| **FIRECalculator** | `currentSavings` | `fhs_totalInvestments` | |
| **FIRECalculator** | `monthlySavings` | `fhs_monthlySavings` | |
| **EmergencyFundCalculator** | `monthlyIncome` | `fhs_monthlyIncome` or `salary_total / 12` | |
| **EmergencyFundCalculator** | `currentSavings` | `fhs_emergencyFund` | |
| **EmergencyFundCalculator** | `emiPayments` | `fhs_monthlyDebtPayment` | |
| **DebtToIncomeCalculator** | `monthlyIncome` | `fhs_monthlyIncome` or `salary_total / 12` | |
| **HomeLoanEligibility** | `monthlyIncome` | `fhs_monthlyIncome` or `salary_total / 12` | |
| **HomeLoanEligibility** | `existingEMI` | `fhs_monthlyDebtPayment` | |
| **InsurancePremiumCalculator** | `age` | `fhs_age` | |

### Implementation Pattern

For each tool, add a `useEffect` on mount that reads relevant `localStorage` keys and sets state only if a matching value is found and > 0. Example:

```typescript
useEffect(() => {
  const salaryTotal = parseFloat(localStorage.getItem('salary_total') || '0');
  const fhsIncome = parseFloat(localStorage.getItem('fhs_monthlyIncome') || '0');
  const income = salaryTotal > 0 ? Math.round(salaryTotal / 12) : fhsIncome;
  if (income > 0) setMonthlyIncome(income);

  const fhsAge = parseFloat(localStorage.getItem('fhs_age') || '0');
  if (fhsAge > 0) setAge(fhsAge);
}, []);
```

A small info toast will show when data is auto-populated: "Pre-filled from your saved data".

### Files Changed (10 files)
- **Edit** `src/pages/FinancialHealthScore.tsx` — auto-fill `monthlyIncome` from `salary_total / 12`
- **Edit** `src/pages/BudgetPlanner.tsx` — auto-fill `monthlyIncome`
- **Edit** `src/pages/RetirementCalculator.tsx` — auto-fill `currentAge`, `monthlyExpenses`
- **Edit** `src/pages/FIRECalculator.tsx` — auto-fill `age`, `monthlyExp`, `currentSavings`, `monthlySavings`
- **Edit** `src/pages/EmergencyFundCalculator.tsx` — auto-fill `monthlyIncome`, `currentSavings`, `emiPayments`
- **Edit** `src/pages/DebtToIncomeCalculator.tsx` — auto-fill `monthlyIncome`
- **Edit** `src/pages/HomeLoanEligibility.tsx` — auto-fill `monthlyIncome`, `existingEMI`
- **Edit** `src/pages/InsurancePremiumCalculator.tsx` — auto-fill `age`
- **Edit** `src/pages/NetWorthCalculator.tsx` — auto-fill investment assets from `fhs_totalInvestments` (set Stocks & MF default)
- **Edit** `src/pages/HomeAffordabilityCalculator.tsx` — auto-fill `monthlyIncome`

