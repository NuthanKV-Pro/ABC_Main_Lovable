

## Plan: Build 18 New Tools in "Other Tools" Category (Under Special Tools)

### Overview
Create a new **"Other Tools"** sub-section within the existing "🛠️ Special Tools" category, containing 18 fully functional tools.

### Tool List (18 Tools)

| # | Tool Name | Key Functionality |
|---|-----------|------------------|
| 1 | **AIS/TIS Reconciliation** | Match Form 26AS with AIS/TIS data, flag discrepancies |
| 2 | **Presumptive Tax Calculator** | 44AD/44ADA eligibility, presumptive income calc |
| 3 | **Crypto Tax Calculator** | 30% VDA tax, 1% TDS, no loss set-off |
| 4 | **NRI Tax Calculator** | Residency status, RNOR, taxable income |
| 5 | **Asset Allocation Optimizer** | Age/goal-based portfolio rebalancing |
| 6 | **IPO Analysis Tool** | GMP tracking, allotment probability, listing gains |
| 7 | **Bond Ladder Calculator** | Maturity staggering, yield optimization |
| 8 | **Human Life Value Calculator** | Insurance needs based on income/dependents |
| 9 | **Multiple Goals Dashboard** | Track progress across financial goals |
| 10 | **Inflation-Adjusted Corpus** | Future value with inflation erosion |
| 11 | **Break-even Analysis** | Fixed/variable costs, units to break even |
| 12 | **Working Capital Calculator** | Current ratio, operating cycle, cash conversion |
| 13 | **Invoice Aging Dashboard** | AR aging buckets, overdue tracking |
| 14 | **Subscription Audit Tool** | Track recurring expenses, identify waste |
| 15 | **Side Hustle Tracker** | Multi-source income tracking, tax implications |
| 16 | **Expense Split Calculator** | Roommate/group expense splitting |
| 17 | **Rent Receipt Generator** | Generate rent receipts for HRA claims |
| 18 | **EMI Prepayment Optimizer** | Compare EMI reduction vs tenure reduction |

### Architecture

**Files to Create:**
- 18 new page files in `src/pages/`
- Each ~150-250 lines with full calculator logic

**Files to Modify:**
- `src/pages/Index.tsx`: Add "Other Tools" category with 18 tool entries
- `src/App.tsx`: Add 18 new routes
- `src/lib/searchData.ts`: Add to search index
- `src/lib/routeConfig.ts`: Add route mappings

### Implementation Pattern (per tool)
```tsx
// Standard structure
const ToolPage = () => {
  const [inputs, setInputs] = useState(...)
  const [results, setResults] = useState(...)
  
  const calculate = () => { /* logic */ }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>...</CardHeader>
        <CardContent>
          {/* Input fields */}
          {/* Calculate button */}
          {/* Results display with charts if applicable */}
        </CardContent>
      </Card>
    </div>
  )
}
```

### UI Placement
The new "Other Tools" category will appear after the existing Special Tools items, with a distinct section header. All 18 tools will have "New" tag with blue styling.

### Technical Notes
- All tools client-side only (no backend)
- Use existing UI components (Card, Input, Button, Tabs)
- Include proper Indian tax rules where applicable (crypto 30%, NRI rules, etc.)
- Tools sync with `useAutoPopulate` where relevant (age, income, PAN)

