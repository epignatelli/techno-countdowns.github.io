# Techno Deadlines

Countdown timers and a calendar for techno festival deadlines (ticket tiers, presale sign‑ups, camping & shuttle bookings, refund/transfer windows, etc.).

Inspired by [:alarm_clock: ai-deadlines](https://github.com/paperswithcode/ai-deadlines).

## Contribute a festival

Edit [`_data/festivals.yml`](./_data/festivals.yml) and add an entry with this schema:

```yaml
- title: "Awakenings"
  year: 2026                     # festival year
  id: awakenings-2026            # unique slug (lowercase, hyphens)
  full_name: "Awakenings Summer Festival"
  link: "https://awakenings.com/" # official website
  timezone: "Europe/Amsterdam"   # IANA tz name
  place: "Hilvarenbeek, NL"      # city, country code
  date: "July 4–6, 2026"          # pretty range for display
  start: "2026-07-04"            # ISO date (optional but recommended)
  end:   "2026-07-06"            # ISO date (optional but recommended)
  genres: ["techno", "hard techno"] # optional tags
  note: "Subject to permits/weather" # optional
  # One festival → many deadlines. Client will pick the next upcoming.
  deadlines:
    - type: presale_signup
      label: "Presale registration closes"
      at:   "2026-01-15 18:00"
    - type: presale
      label: "Presale starts"
      at:   "2026-01-17 10:00"
    - type: general_sale
      label: "General sale"
      at:   "2026-01-20 10:00"
    - type: camping_booking
      label: "Camp + locker booking opens"
      at:   "2026-03-01 12:00"
    - type: refund_transfer
      label: "Name transfer deadline"
      at:   "2026-06-20 23:59"
```

### Valid `type` values (use freely; UI groups by these)
`presale_signup`, `presale`, `general_sale`, `tier1_ends`, `tier2_ends`, `payment_plan`, `camping_booking`, `shuttle_booking`, `boat_party_booking`, `refund_transfer`, `travel_package`, `lineup_drop`, `other`.

### Timezones
Use **IANA tz** names (e.g., `Europe/Berlin`). Times are assumed in the festival `timezone`.

### Tips
- If a festival has *no* deadlines yet, omit `deadlines` — it will still list under “dates TBA”.
- If a deadline time is unknown, you can use just a date (e.g., `2026-01-20`).

## Build & run locally

```bash
# requires Ruby + Bundler for Jekyll (or use GitHub Pages directly)
bundle install
bundle exec jekyll serve
```

## Validation on PRs
All changes to `_data/festivals.yml` are automatically validated:
- required keys present (`title`, `year`, `id`, `link`, `timezone`)
- unique `id` slugs
- valid date/time formats and IANA timezones

If CI fails, read the Action logs for the exact error.

## Calendar export (.ics)
Click **Download .ics** on the website to export all deadlines into your calendar app (Google/Apple/Outlook). Events default to 1 hour and use UTC.

## License
MIT
