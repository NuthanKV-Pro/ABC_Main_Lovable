

## Problem

April 2026 shows zero events because all current events have due dates starting from May 2026 onwards. The GST returns for April are due in May, and TDS for April is due May 7. However, April 2026 should contain deadlines carried over from the previous period (FY 2025-26) whose due dates fall in April 2026.

## Missing April 2026 Events to Add

**TDS/TCS (due in April 2026):**
- TDS/TCS Payment for March 2026 (Non-Govt) — April 7, 2026
- TDS/TCS Payment for March 2026 (Govt) — April 7, 2026 (same-day rule, but practically filed in April)

**GST (due in April 2026):**
- GSTR-1 for March 2026 — April 11, 2026
- GSTR-3B for March 2026 — April 20, 2026
- CMP-08 Q4 (Jan-Mar 2026) — April 18, 2026
- GSTR-4 Annual (Composition) FY 2025-26 — April 30, 2026

**Income Tax:**
- Last date to file Updated ITR u/s 139(8A) for AY 2024-25 — already might be past, but worth noting

**ROC:**
- LLP Form 11 for FY 2025-26 — May 30 (not April, skip)

## Plan

1. **Add ~8 new events** to the `allEvents` array with `dueDate` values in April 2026 (2026-04-XX), covering the carry-over TDS payment, GSTR-1, GSTR-3B, CMP-08, and GSTR-4 deadlines from the previous period (March 2026 / FY 2025-26).

2. **Fix the existing `tds-mar-other` entry** — it currently has dueDate `2027-04-30` for March 2027 TDS, which is correct. But there's no equivalent entry for March 2026 TDS due April 7, 2026.

3. No structural changes needed — just data additions to the `allEvents` array.

