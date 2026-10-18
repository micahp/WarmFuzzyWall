#!/usr/bin/env python3
"""
Build a WarmFuzzyWall /api/notes/import payload from recovered/notes.json.

The recovered dataset stores human-readable dates ("Apr 23", "May 2") because
that's all the evidence supported. The app needs real timestamps so the wall
sorts correctly (newest first). This script resolves each note's display date
to a concrete timestamp on the correct year, preserving wall order.

Usage:
    python3 build_import.py                  # writes recovered/import_payload.json
    python3 build_import.py --year 2025      # override the inferred year

Ordering logic
--------------
The app sorts by createdAt DESC (newest first) and paginates 12 per page.
To reproduce the original wall layout, notes are assigned timestamps in the
order they appeared on the wall, spaced one hour apart, so that:
  - May 9 / May 2 / Apr 25 / Apr 24 notes sort to the top (they're newest)
  - Apr 23 notes fill out beneath them in their on-wall order
"""

import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path

HERE = Path(__file__).parent
NOTES = HERE / "notes.json"
OUT = HERE / "import_payload.json"

# The wall was live around the 30th birthday: Apr 23, 2025.
DEFAULT_YEAR = 2025

# Wall order, top-left to bottom-right, as reconstructed from the screenshots.
# This is NOT the same as note id order - it's the visual position on the wall.
WALL_ORDER = [
    # Row 1
    1,   # Hope (blue)
    2,   # Crystal Gravy
    3,   # Anonymous parking meter
    4,   # TB
    # Row 2
    5,   # JP
    6,   # JD
    7,   # Allie
    8,   # Mani
    # Row 3
    16,  # GG
    13,  # Bryan
    14,  # Quana
    15,  # Yer cute
    # Row 4
    11,  # NFT Daddy
    12,  # Posse scholar
    17,  # Margrit Pez
    9,   # Sarang
    # Any note not yet placed (Geo)
    10,  # Geo - "I love you"
]

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def parse_date(raw, year):
    """Turn a display date into (month, day). Returns None if unparseable."""
    if not raw:
        return None
    s = str(raw).strip()
    # "Apr 23" / "May 2"
    bits = s.replace(",", " ").split()
    if not bits:
        return None
    mon = MONTHS.get(bits[0][:3].lower())
    if mon is None:
        return None
    day = None
    for b in bits[1:]:
        if b.isdigit() and 1 <= int(b) <= 31:
            day = int(b)
            break
    if day is None:
        return None
    return (mon, day)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--year", type=int, default=DEFAULT_YEAR)
    args = ap.parse_args()

    data = json.loads(NOTES.read_text())
    by_id = {n["id"]: n for n in data["notes"]}

    # Order notes by wall position; anything unlisted goes last by id.
    seen = set()
    ordered = []
    for nid in WALL_ORDER:
        if nid in by_id and nid not in seen:
            ordered.append(by_id[nid])
            seen.add(nid)
    for n in sorted(data["notes"], key=lambda x: x["id"]):
        if n["id"] not in seen:
            ordered.append(n)
            seen.add(n["id"])

    # Assign timestamps. Notes are spaced 1 hour apart in wall order, but each
    # note is pinned to its own calendar date so sorting by createdAt DESC keeps
    # the newest-dated notes on top.
    #
    # Approach: group by parsed date, then within each date assign descending
    # hours in wall order. Date groups are ordered oldest -> newest so the
    # newest dates land on top after a DESC sort.
    dated = []
    undated = []
    for idx, n in enumerate(ordered):
        md = parse_date(n.get("date"), args.year)
        if md is None:
            undated.append(n)
        else:
            dated.append((md, idx, n))

    # Newest date first for sort stability; we assign timestamps then reverse.
    dated.sort(key=lambda t: (t[0][0], t[0][1], t[1]))

    out = []
    # Assign each date-group a base day; within a group, spread notes by hour
    # so their relative order is deterministic. Earlier wall position = later
    # hour, because the wall shows newest first.
    from itertools import groupby
    for (mon, day), group in groupby(dated, key=lambda t: t[0]):
        group = list(group)
        n_items = len(group)
        for pos, (_md, _idx, note) in enumerate(group):
            # Later wall position -> earlier hour, so DESC sort keeps wall order
            hour = 8 + (n_items - pos)
            ts = datetime(args.year, mon, day, hour, 0, 0)
            out.append((ts, note))

    for note in undated:
        # No date evidence at all - place at the start of the wall date.
        ts = datetime(args.year, 4, 23, 7, 0, 0)
        out.append((ts, note))

    # Build the payload the app's /api/notes/import expects.
    payload_notes = []
    for ts, note in sorted(out, key=lambda p: p[0]):
        color = note.get("color") or "sticky-yellow"
        payload_notes.append({
            "message": note["text"],
            "author": note.get("author") or "Anonymous",
            "recipient": note.get("recipient"),
            "color": color,
            "createdAt": ts.isoformat() + "Z",
        })

    payload = {
        "clearExisting": True,
        "notes": payload_notes,
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    print(f"wrote {OUT}")
    print(f"  {len(payload_notes)} notes, year {args.year}, clearExisting=True")
    for p in payload_notes:
        print(f"  {p['createdAt']}  {(p['author'] or '')[:18]:18}  {p['color']:14} {p['message'][:40]}")


if __name__ == "__main__":
    main()
