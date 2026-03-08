

## Plan: Add Life Event Wizards Tool to Special Tools

### Overview
Create a new `LifeEventWizards` page with 4 guided flows (Buying a House, Getting Married, Starting a Business, Planning Retirement). Each flow shows a sequence of relevant existing tools as steps. Add it as a card in the "Special Tools" section on Index.

### Changes

**1. Create `src/pages/LifeEventWizards.tsx`**
- Page with 4 life event cards, each expandable/clickable to show a step-by-step sequence of relevant tools
- Each event shows numbered steps linking to existing routes:
  - **Buying a House**: Home Affordability → Home Loan Eligibility → Stamp Duty → EMI Calculator → Rent vs Buy → Section 54 Planner → Real Estate ROI
  - **Getting Married**: Wedding Budget Planner → Gold Loan Calculator → Budget Planner → Insurance Premium → Will & Estate Planner
  - **Starting a Business**: Business Valuation → Tax Audit Checker → GST Invoice Generator → Financial Statements → Startup Funding Guide → Compliance Calendar
  - **Planning Retirement**: Retirement Calculator → FIRE Calculator → NPS Calculator → Gratuity Calculator → PPF Calculator → SWP Calculator
- Each step is a clickable card showing tool name, description, and step number with a "Start" button

**2. Update `src/pages/Index.tsx`**
- Add a "Life Event Wizards" tool entry in the Special Tools category (alongside Compare & Decide)
- Icon: `Workflow` or `Rocket`, route: `/life-event-wizards`

**3. Update `src/App.tsx`**
- Import and add route for `/life-event-wizards`

**4. Update `src/lib/routeConfig.ts`**
- Add `/life-event-wizards` with parent `/prototypes`

