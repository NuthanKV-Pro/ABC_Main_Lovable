

## Plan: Add Per-Tool Reset Button (Icon) to Clear Saved Data

### Approach
Add a `RotateCcw` icon button in the header of every tool/module that persists data to `localStorage`. On click, it clears **only** that tool's localStorage keys and resets component state to defaults. Tools that already have a Reset/Clear button will have their existing handler enhanced to also remove localStorage keys (no duplicate button added).

### Tools & Their localStorage Keys to Clear

| Tool | Keys to Remove | Has Existing Reset? |
|------|---------------|-------------------|
| **Salary** | `salary_data`, `salary_total`, `form16_data` | Yes (`handleClearForm`) — enhance it |
| **Deductions** | `deductions_data`, `deductions_total` | No — add icon |
| **HouseProperty** | `hp_total` | No — add icon |
| **CapitalGains** | `cg_data`, `cg_total` | No — add icon |
| **BusinessProfession** | `bp_data`, `pgbp_total` | No — add icon |
| **OtherSources** | `os_total` | No — add icon |
| **FinancialHealthScore** | `fhs_*` (10 keys) | Yes (`handleReset`) — enhance it |
| **BudgetPlanner** | no dedicated keys but reset state | No — add icon |
| **FIRECalculator** | `fire_target`, `fire_corpus`, `fire_age`, `fire_years`, `fire_savings_rate` | No — add icon |
| **RetirementCalculator** | `retirement_corpus_needed`, `retirement_monthly_savings`, `retirement_data` | No — add icon |
| **EmergencyFundCalculator** | `emergency_fund_target`, `emergency_fund_current`, `emergency_fund_saved`, `emergency_fund_months` | No — add icon |
| **NetWorthCalculator** | `net_worth_total`, `net_worth_assets`, `net_worth_liabilities`, `net_worth_data` | No — add icon |
| **SIPCalculator** | `sip_monthly`, `sip_data` | No — add icon |
| **EMICalculator** | `emi_monthly_total`, `emi_data` | No — add icon |
| **WeddingBudgetPlanner** | `wedding_budget_data` | No — add icon |
| **HUFTaxPlanner** | `huf_planner_data` | No — add icon |
| **ComplianceCalendar** | `compliance_completed_2026` | No — add icon |
| **FinancialStatements** | `financialStatementsData`, `financialStatementsJournals`, `financialStatementsSaved` | Yes (`resetData`) — enhance it |
| **FinancialRatios** | `financialRatiosData`, `financialRatiosMultiYear`, `financialRatiosIndustry`, `financialRatiosCompanyName`, `financialRatiosSavedReports` | No — add icon |
| **GSTInvoiceGenerator** | drafts key | No — add icon |

### Implementation Pattern

For each tool **without** an existing reset:
1. Import `RotateCcw` from lucide-react
2. Add a `handleReset` function that calls `localStorage.removeItem()` for each key, resets component state to defaults, and shows a toast
3. Place a `<Button variant="ghost" size="icon">` with `<RotateCcw>` in the header next to existing action buttons, wrapped in a Tooltip saying "Reset data"

For tools **with** an existing reset (Salary, FHS, FinancialStatements):
- Enhance the existing handler to also `removeItem` the relevant localStorage keys — no new button added

### Confirmation Dialog
Each reset will use `window.confirm("Reset all data in this tool?")` before proceeding, to prevent accidental data loss.

### Files Changed (20 files)
- **Edit** `src/pages/Salary.tsx` — enhance `handleClearForm` to remove `salary_data`, `salary_total`
- **Edit** `src/pages/Deductions.tsx` — add reset icon + handler
- **Edit** `src/pages/HouseProperty.tsx` — add reset icon + handler
- **Edit** `src/pages/CapitalGains.tsx` — add reset icon + handler
- **Edit** `src/pages/BusinessProfession.tsx` — add reset icon + handler
- **Edit** `src/pages/OtherSources.tsx` — add reset icon + handler
- **Edit** `src/pages/FinancialHealthScore.tsx` — enhance `handleReset` to remove `fhs_*` keys
- **Edit** `src/pages/BudgetPlanner.tsx` — add reset icon + handler
- **Edit** `src/pages/FIRECalculator.tsx` — add reset icon + handler
- **Edit** `src/pages/RetirementCalculator.tsx` — add reset icon + handler
- **Edit** `src/pages/EmergencyFundCalculator.tsx` — add reset icon + handler
- **Edit** `src/pages/NetWorthCalculator.tsx` — add reset icon + handler
- **Edit** `src/pages/SIPCalculator.tsx` — add reset icon + handler
- **Edit** `src/pages/EMICalculator.tsx` — add reset icon + handler
- **Edit** `src/pages/WeddingBudgetPlanner.tsx` — add reset icon + handler
- **Edit** `src/pages/HUFTaxPlanner.tsx` — add reset icon + handler
- **Edit** `src/pages/ComplianceCalendar.tsx` — add reset icon + handler
- **Edit** `src/pages/FinancialStatements.tsx` — enhance `resetData` to remove localStorage keys
- **Edit** `src/pages/FinancialRatios.tsx` — add reset icon + handler
- **Edit** `src/pages/GSTInvoiceGenerator.tsx` — add reset icon + handler

