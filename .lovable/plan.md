

## Plan: Replace "Compare & Decide" Category with "Special Tools" Section

### What Changes

1. **Create `src/pages/CompareAndDecide.tsx`** — A new hub page containing all 4 comparison tools (PPF vs ELSS vs NPS vs FD, SIP vs Lumpsum vs RD, Old vs New Regime, Term vs Endowment vs ULIP) as navigable cards. Users click through to existing routes.

2. **Add route** in `src/App.tsx` and `src/lib/routeConfig.ts` for `/compare-and-decide`.

3. **Replace the "🔀 Compare & Decide" category** in `src/pages/Index.tsx` with a new **"🛠️ Special Tools"** category placed right after "⭐ Featured Tools". It will contain a single tool card:
   - **Compare & Decide** — "Side-by-side comparisons for smarter financial decisions" → links to `/compare-and-decide`

4. **Style "Special Tools"** similarly to how "Compare" was styled (distinct border/gradient) so it stands out, but with its own identity (e.g., `isSpecial` flag instead of `isCompare`).

5. **Remove** duplicate comparison tools from "Tax Planning & Optimization" category (the `tax-saving-comparison` entry at line ~247).

### Technical Notes
- The new `CompareAndDecide` page will reuse the standard page layout pattern (header with back button, grid of cards linking to existing routes)
- Existing comparison page routes remain unchanged — only the navigation entry point changes

