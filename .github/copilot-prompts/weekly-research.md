# Weekly Copilot Research: European Techno Festivals — Deep Search & PR

> You are replying **inside the Issue that scheduled this task**. When you open the pull request, **include a closing keyword that references this issue** so it auto-closes on merge — e.g.:
>
> **Closes: #{this_issue_number}**
>
> (Replace `#{this_issue_number}` with the numeric ID of *this* issue, like `#123`.)

## Goal
Perform a **deep web search** to update `_data/festivals.yml` with **upcoming deadlines** for European techno festivals, then open a PR with the changes that **auto-closes this issue**.

## Scope & Sources
1. Ensure coverage of the majors first (don’t miss these):  
   Awakenings (NL), Time Warp Mannheim (DE), Dekmantel (NL), Kappa FuturFestival (IT), Sonus (HR), Neopop (PT), DGTL Amsterdam (NL), Loveland (NL), Junction 2 (UK), Terminal V (UK), Nature One (DE), Melt (DE), Caprices (CH), Monegros (ES), Dimensions (HR).
2. Then broaden via trustworthy sources:
   - **Official festival sites / organizers**
   - Ticketing partners (Paylogic/Eventim/See Tickets/Ticketmaster local)
   - Reputable listings (Resident Advisor, venue/city pages)
3. Prefer **official** sources when dates/times conflict.

## Data to capture per festival
Add or update an item in `_data/festivals.yml` with:
- `title` (short), `id` (slug), `link` (official site), `timezone` (IANA), `place` (“City, CC”), `date` (pretty range), optional `start`, `end` (ISO `YYYY-MM-DD`).
- `deadlines`: upcoming items, each with:
  - `type` ∈ { `presale_signup`, `presale`, `general_sale`, `tier1_ends`, `tier2_ends`, `payment_plan`, `camping_booking`, `shuttle_booking`, `refund_transfer`, `travel_package`, `lineup_drop`, `other` }
  - `label` (short human title)
  - `at` as `YYYY-MM-DD HH:MM` (24h) if time known, else `YYYY-MM-DD`.

**Rules**
- Include **upcoming** or still-relevant deadlines only (omit past ones).
- **Merge** with existing entries (don’t delete unless clearly superseded).
- Keep YAML valid; sort festivals by next upcoming deadline (fallback: `start`).

## Deliverables
1. Commit changes to `_data/festivals.yml` on a new branch.
2. Open a PR to `main` titled:  
   `feat(data): weekly refresh of EU techno festivals`
3. **PR Body must include a closing keyword for this issue**, e.g.:  
   `Closes: #<ISSUE_NUMBER>`  
   Also list each added/updated festival with bullet links to the exact source page(s) used and summarize:
   - N festivals added, M updated
   - X deadlines added, Y removed
   - Any ambiguous/TBA notes (e.g., date confirmed, time TBA)

## Validation before PR
- Parse `_data/festivals.yml` to ensure it’s valid YAML.
- If any field is uncertain, add a brief note in the PR body under that festival.

## Notes
- Times should be in the festival’s **local timezone** when known. If only a date is public, store `YYYY-MM-DD` (no time).
- Keep the site’s HTML/CSS/JS unchanged; this task is **data-only**.
