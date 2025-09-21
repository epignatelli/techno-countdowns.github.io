#!/usr/bin/env python3
import sys, re
from pathlib import Path

try:
    import yaml
except Exception:
    print("::error file=scripts/validate_festivals.py::PyYAML missing. Add to workflow.")
    sys.exit(1)

# Prefer stdlib zoneinfo; fallback to pytz
try:
    from zoneinfo import ZoneInfo
    def is_tz(s):
        try:
            ZoneInfo(s)
            return True
        except Exception:
            return False
except Exception:
    def is_tz(s):
        try:
            import pytz
            return s in pytz.all_timezones
        except Exception:
            return False

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}(?:\s\d{2}:\d{2})?$")
REQ_TOP = {"title","year","id","link","timezone"}
REQ_DL  = {"type","label","at"}

errs = []
p = Path("_data/festivals.yml")
if not p.exists():
    print("::error::_data/festivals.yml not found")
    sys.exit(1)

data = yaml.safe_load(p.read_text()) or []
if not isinstance(data, list):
    errs.append("Top-level YAML must be a list")

ids = set()
for i, f in enumerate(data or []):
    ctx = f"festival[{i}]"
    missing = REQ_TOP - set(f.keys())
    if missing:
        errs.append(f"{ctx}: missing keys {sorted(missing)}")
    fid = (f.get("id") or "").strip()
    if not fid:
        errs.append(f"{ctx}: id is empty")
    elif fid in ids:
        errs.append(f"{ctx}: duplicate id '{fid}'")
    else:
        ids.add(fid)
    tz = f.get("timezone")
    if not tz or not is_tz(tz):
        errs.append(f"{ctx}: invalid timezone '{tz}'")
    for k in ("start","end"):
        if f.get(k) and not DATE_RE.fullmatch(f[k]):
            errs.append(f"{ctx}: '{k}' must be 'YYYY-MM-DD'")
    dls = f.get("deadlines", []) or []
    if not isinstance(dls, list):
        errs.append(f"{ctx}: deadlines must be a list")
    for j, d in enumerate(dls):
        dctx = f"{ctx}.deadlines[{j}]"
        if not isinstance(d, dict):
            errs.append(f"{dctx}: must be a mapping")
            continue
        miss = REQ_DL - set(d.keys())
        if miss:
            errs.append(f"{dctx}: missing keys {sorted(miss)}")
        at = d.get("at")
        if at and not DATE_RE.fullmatch(at):
            errs.append(f"{dctx}: 'at' must be 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM'")

if errs:
    print("::error::Validation failed:\n" + "\n".join(f"- {e}" for e in errs))
    sys.exit(2)

print("YAML validation passed. Checked", len(data or []), "festivals.")
