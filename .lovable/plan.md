

## Plan: Add Global "Clear All Saved Data" with Triple Confirmation on My Financial Profile

### What
Add a destructive "Clear All Saved Data" button to the My Financial Profile page header. Clicking it triggers a **3-step AlertDialog confirmation chain** — the user must confirm three times before any data is deleted. This prevents accidental wipes.

### Triple Confirmation Flow
1. **Dialog 1**: "Are you sure?" — general warning that all tool data will be erased
2. **Dialog 2**: "This cannot be undone" — emphasizes permanence, lists affected areas (tax, calculators, health score, etc.)
3. **Dialog 3**: "Final confirmation" — last chance, bright destructive styling, "Yes, delete everything" button

### Data Cleared
Call `localStorage.clear()` to wipe all keys across every tool (salary, deductions, FHS, FIRE, net worth, SIP, EMI, retirement, emergency fund, budget, sync keys, compliance, GST, HUF, wedding, financial statements, ratios, profile, preferences — everything).

### UI Placement
Next to the existing "Sync All Tools" button in the header bar, add a `Trash2` icon button (destructive ghost variant). This triggers Dialog 1.

### Implementation
- **Edit** `src/pages/MyFinancialProfile.tsx`:
  - Add `Trash2` icon import
  - Add `clearStep` state (0 = closed, 1/2/3 = which dialog is open)
  - Render 3 `AlertDialog` components controlled by `clearStep` state
  - On final confirm: `localStorage.clear()`, toast, and `window.location.reload()` to reset all in-memory state
  - Each dialog's "Continue" advances `clearStep`; Cancel resets to 0

### Files Changed (1 file)
- **Edit** `src/pages/MyFinancialProfile.tsx`

