

## Plan: Move "Clear All Saved Data" Button to Top Navigation Bar

### What
Move the triple-confirmation "Clear All Saved Data" (Trash2 icon) button from the My Financial Profile page into the main top-right navigation bar in `src/pages/Index.tsx`, positioned between the `SearchBar` and the Compliance Calendar button.

### Changes

**1. Edit `src/pages/Index.tsx`**
- Import `Trash2` icon, `AlertDialog` components, `toast`, and add `clearStep` state
- Add the Trash2 icon button + 3 AlertDialog components (same triple-confirmation logic currently in MyFinancialProfile)
- Place the button in the header between `<SearchBar />` and the Calendar `<Tooltip>`

**2. Edit `src/pages/MyFinancialProfile.tsx`**
- Remove the Trash2 button and all 3 AlertDialog components
- Remove `clearStep` state and related imports (`Trash2`, `AlertDialog*`)
- Keep the Sync button as-is

### Files Changed (2)
- **Edit** `src/pages/Index.tsx`
- **Edit** `src/pages/MyFinancialProfile.tsx`

