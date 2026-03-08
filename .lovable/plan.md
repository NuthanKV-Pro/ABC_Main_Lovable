

## Plan: Add Profile Icon Button + Enhanced Profile with Legal Entities

### Overview
Add a `User` icon button to the extreme top-right of the header (after the BookOpen button), and enhance the ProfileSettings page with a Legal Entities management section. Update the `useUserProfile` hook to manage legal entities.

### Changes

**1. `src/pages/Index.tsx`**
- Import `User` icon from lucide-react
- Add a `User` icon button with Tooltip ("My Profile") after the BookOpen button (line ~1126), navigating to `/profile`

**2. `src/hooks/useUserProfile.ts`**
- Add `LegalEntity` interface: `id`, `name`, `type` (enum of entity types), `pan`, `gstns: string[]`, `registeredAddress`, `businessAddress`, `natureOfBusiness`, `dateOfIncorporation`
- Add `legalEntities` state backed by `legal_entities` localStorage key
- Expose `addEntity`, `updateEntity`, `deleteEntity` methods
- Auto-save to localStorage on changes

**3. `src/pages/ProfileSettings.tsx`**
- Add new "Legal Entities" card section below Personal Information
- Display entities as collapsible cards (using Collapsible component) with entity name/type as header, edit/delete actions
- "Add Entity" button opens a Dialog with form fields:
  - Entity name (Input), Type (Select with 8 options), PAN (Input), Nature of business (Input), Date of incorporation (date Input)
  - Registered address + Business address (Inputs)
  - Dynamic GSTN list: multiple inputs with Plus/X buttons to add/remove
- Edit reuses the same dialog pre-filled
- Delete with confirmation AlertDialog

### Files Changed (3)
- `src/pages/Index.tsx` — add User icon button
- `src/hooks/useUserProfile.ts` — add LegalEntity interface + CRUD methods
- `src/pages/ProfileSettings.tsx` — add Legal Entities section with add/edit/delete UI

