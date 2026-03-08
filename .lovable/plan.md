

## Plan: Add Business Valuation to Featured Tools on Index Page

**What**: Add a "Business Valuation" card to the Featured Tools section in `/src/pages/Index.tsx`.

**How**:
1. Add a new tool entry after the existing featured tools (e.g., after "Salary Optimisation Engine") in the `⭐ Featured Tools` array (~line 171):
   - `id`: `"business-valuation"`
   - `title`: `"Business Valuation"`
   - `description`: `"DCF, Comps, LBO & Monte Carlo"`
   - `icon`: `TrendingUp` (already imported)
   - `route`: `"/business-valuation"`
   - `tag`: `"Live"`
   - `tagColor`: green (matching other Live tools)
   - `starred`: `true`

Single file edit, one new object added to the array.

