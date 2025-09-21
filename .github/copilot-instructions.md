# Techno Countdowns Website

Techno Countdowns is a Jekyll-based static website that displays countdown timers and calendar exports for techno festival deadlines (ticket tiers, presale sign-ups, camping & shuttle bookings, refund/transfer windows, etc.). The site is automatically deployed to GitHub Pages and features interactive filtering, search, and calendar export functionality.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Dependencies
- Install Ruby bundler: `sudo gem install bundler`
- Configure local gem installation: `bundle config set --local path vendor/bundle`
- Install Jekyll dependencies: `bundle install` -- takes ~2 minutes. NEVER CANCEL. Set timeout to 180+ seconds.
- Install Python dependencies for validation: `pip install PyYAML pytz`

### Build and Validation
- Build static site: `bundle exec jekyll build` -- takes ~1 second
- Validate festival data: `python3 scripts/validate_festivals.py` -- takes ~0.08 seconds
- ALWAYS run validation after modifying `_data/festivals.yml` or validation script

### Development Server
- Start development server: `bundle exec jekyll serve --host 0.0.0.0 --port 4000`
- Access at: `http://localhost:4000/techno-deadlines.github.io/`
- Server starts immediately and supports auto-regeneration
- Stop with Ctrl+C when done testing

### Manual Validation Scenarios
After making changes to the website, ALWAYS test these complete user scenarios:

#### Required Testing Workflow
1. **List View**: Verify all festivals display in table format with correct data (festival name, location, dates, deadlines, countdown)
2. **Board View**: Click "Board" button and verify card-based layout displays correctly
3. **Search Functionality**: Type festival name in search box (e.g., "awakenings") and verify filtering works
4. **Dropdown Filters**: Test deadline type, month, and country filters
5. **Calendar Export**: Click "Download .ics (filtered)" and verify file downloads with valid iCal format
6. **Individual Festival Export**: Click individual "Download .ics" buttons for specific festivals

#### Validation Commands
- Check server accessibility: `curl -I http://localhost:4000/techno-deadlines.github.io/`
- Verify JSON data endpoint: `curl http://localhost:4000/techno-deadlines.github.io/assets/festivals.json`

## Repository Structure

### Key Files and Directories
```
├── _config.yml              # Jekyll configuration
├── _data/
│   └── festivals.yml       # Festival data (EDIT THIS to add festivals)
├── assets/
│   ├── app.js              # JavaScript for filtering and calendar export
│   ├── styles.css          # Website styling
│   └── festivals.json      # Generated from YAML (don't edit directly)
├── scripts/
│   └── validate_festivals.py # Data validation script
├── .github/
│   └── workflows/
│       ├── jekyll.yml      # Deployment to GitHub Pages
│       └── weekly-copilot-research.yml # Automated research workflow
├── Gemfile                 # Ruby dependencies
├── index.html              # Main page template
└── vendor/                 # Local gem installation (gitignored)
```

### Critical Data Schema
The `_data/festivals.yml` file uses this exact schema:
```yaml
- title: "Festival Name"           # Required
  year: 2026                       # Required - integer
  id: unique-slug-2026            # Required - unique lowercase with hyphens
  link: "https://example.com/"     # Required - official website
  timezone: "Europe/Berlin"       # Required - IANA timezone
  place: "City, COUNTRY_CODE"      # Optional but recommended
  date: "July 4–6, 2026"          # Optional - display string
  start: "2026-07-04"             # Optional - ISO date
  end: "2026-07-06"               # Optional - ISO date
  deadlines:                      # Optional - list of deadlines
    - type: presale_signup        # Required - see valid types below
      label: "Presale signup"     # Required - display name
      at: "2026-01-15 18:00"      # Required - YYYY-MM-DD or YYYY-MM-DD HH:MM
```

Valid deadline types: `presale_signup`, `presale`, `general_sale`, `tier1_ends`, `tier2_ends`, `payment_plan`, `camping_booking`, `shuttle_booking`, `boat_party_booking`, `refund_transfer`, `travel_package`, `lineup_drop`, `other`

## Continuous Integration

### GitHub Actions Workflows
- **Jekyll Deployment** (`.github/workflows/jekyll.yml`): Builds and deploys to GitHub Pages on every push to main
- **Data Validation** (`workflows/validate.yml`): Validates festival YAML on PRs affecting `_data/` or validation script

### Pre-commit Validation
ALWAYS run these commands before committing changes to festival data:
```bash
python3 scripts/validate_festivals.py
bundle exec jekyll build
```

## Common Tasks

### Adding a New Festival
1. Edit `_data/festivals.yml` following the exact schema above
2. Ensure unique `id` field (lowercase, hyphens only)
3. Use valid IANA timezone names (e.g., "Europe/Berlin", "America/New_York")
4. Run validation: `python3 scripts/validate_festivals.py`
5. Test locally: `bundle exec jekyll serve` and verify festival appears correctly
6. Test all user scenarios listed above

### Troubleshooting
- **Permission errors during bundle install**: Use `bundle config set --local path vendor/bundle` to install gems locally
- **Server not accessible**: Ensure using `--host 0.0.0.0` flag for external access
- **Validation failures**: Check console output for specific YAML errors (missing required fields, invalid timezones, duplicate IDs)
- **Calendar export issues**: Verify deadline dates are in correct format (`YYYY-MM-DD` or `YYYY-MM-DD HH:MM`)

### File Locations Reference
- Festival data: `_data/festivals.yml`
- JavaScript logic: `assets/app.js`
- Main page: `index.html`
- Validation script: `scripts/validate_festivals.py`
- Build output: `_site/` (auto-generated, don't edit)
- Local gems: `vendor/` (gitignored)

## Development Notes
- Jekyll automatically converts `_data/festivals.yml` to `assets/festivals.json` during build
- The website uses vanilla JavaScript (no build process required for JS/CSS)
- All times are displayed in user's local timezone but stored in festival's timezone
- Calendar exports use UTC times with proper timezone handling
- Site is responsive and works on mobile devices