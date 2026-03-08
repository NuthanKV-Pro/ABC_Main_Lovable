

# Implementation Plan: 7 New Tools

## New Files to Create (7 pages)

| # | File | Route | Category in Index.tsx |
|---|------|-------|---------------------|
| 1 | `src/pages/HUFTaxPlanner.tsx` | `/huf-tax-planner` | Tax Planning & Optimization |
| 2 | `src/pages/RegimeOptimizer.tsx` | `/regime-optimizer` | Tax Planning & Optimization |
| 3 | `src/pages/FIRECalculator.tsx` | `/fire-calculator` | Retirement & Benefits |
| 4 | `src/pages/RealEstateROICalculator.tsx` | `/real-estate-roi` | Real Estate & Property |
| 5 | `src/pages/WeddingBudgetPlanner.tsx` | `/wedding-budget-planner` | Personal Finance & Planning |
| 6 | `src/pages/EducationCostPlanner.tsx` | `/education-cost-planner` | Personal Finance & Planning |
| 7 | `src/pages/StartupFundingGuide.tsx` | `/startup-funding-guide` | Business & Corporate Finance |

## Tool Specifications

1. **HUF Tax Planner** — Karta/coparcener member management, HUF income entry (rental, business, interest), HUF-specific deductions (80C), individual vs HUF tax comparison card, localStorage persistence

2. **Regime Optimizer** — Uses `useTaxData` hook to pull all entered data, computes exact tax under old regime (with all deductions) and new regime (standard deduction only), clear recommendation banner with exact savings amount, deduction-by-deduction breakdown showing what's lost/kept

3. **FIRE Calculator** — Inputs: current age, monthly expenses, savings, savings rate slider, expected returns, inflation. Outputs: FIRE number (25x annual expenses), years to FIRE, projected savings trajectory chart (Recharts), India-specific SWR analysis

4. **Real Estate ROI Calculator** — Purchase price, stamp duty/registration (state-wise defaults), annual maintenance, rental income with vacancy rate, capital appreciation, loan interest, tax impact (Section 24, LTCG), true annualized ROI vs alternatives (FD, MF)

5. **Wedding Budget Planner** — Indian categories (venue, catering, decoration, jewelry, trousseau, photography, mehendi, sangeet, baraat, invitations), budget vs actual per category, guest count, gift tracker table, pie chart breakdown, total budget dashboard

6. **Education Cost Planner** — India vs abroad toggle, course type/duration, current cost input, inflation projection (6-8% India, 3-5% abroad), savings vehicle comparison table (SSY, PPF, MF, education loan, FD) with projected corpus, gap analysis with recommended SIP

7. **Startup Funding Guide** — Tabbed directory with search/filter: Government Schemes tab (central: Startup India, MUDRA, Stand-Up India, SIDBI, MSME schemes; state schemes for major states), VCs tab (Peak XV/Sequoia, Accel, Blume, Matrix, Kalaari, Nexus, Lightspeed, Tiger Global, Elevation, etc.), Angel Networks tab (Indian Angel Network, Mumbai Angels, LetsVenture, AngelList India). Each entry: name, description, stage focus, sector focus, typical ticket size, website link, key people with LinkedIn links. Filterable by stage and sector.

## Files to Modify (4)

1. **`src/App.tsx`** — Add 7 imports and 7 `<Route>` entries inside `BreadcrumbLayout`

2. **`src/pages/Index.tsx`** — Add tool cards to existing category arrays:
   - Tax Planning & Optimization: HUF Tax Planner, Regime Optimizer
   - Retirement & Benefits: FIRE Calculator
   - Real Estate & Property: Real Estate ROI Calculator
   - Personal Finance & Planning: Wedding Budget Planner, Education Cost Planner
   - Business & Corporate Finance: Startup Funding Guide

3. **`src/lib/routeConfig.ts`** — Add 7 entries with `parent: "/prototypes"`

4. **`src/lib/searchData.ts`** — Add entries to appropriate arrays: `taxPlanningTools`, `retirementTools`, `realEstateTools`, `personalFinanceTools`, `businessTools`

## Technical Patterns
- All tools follow existing Card-based layout with shadcn/ui components
- localStorage persistence where applicable (HUF, Wedding Budget, Education Cost)
- Regime Optimizer uses `useTaxData` hook for cross-tool data flow
- ExportButton on tools with calculated outputs (FIRE, Real Estate ROI, Wedding Budget, Education Cost, HUF)
- Startup Funding Guide is a static curated data directory — no calculations, just search/filter
- Recharts for charts in FIRE Calculator and Wedding Budget Planner
- All icons from lucide-react (already imported set + new ones as needed: `Users`, `Flame`, `Building2`, `Heart`, `GraduationCap`, `Rocket`)

