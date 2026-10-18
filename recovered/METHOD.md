# How this was recovered

The original database is gone. Everything here was reconstructed from footage that
happened to survive.

## Sources

**1. The YouTube demo video** — [Demoing a Replit app: Warm Fuzzy Birthday Wall](https://youtu.be/_PtelREnQqY)

163.8 seconds, 1280×720. Downloaded at full resolution, sampled at 2 fps to get 328
frames, then clustered those frames by perceptual similarity to find the 42 distinct
screens in the recording. One representative frame per distinct view was OCR'd.

**2. The video's thumbnail** — `https://i.ytimg.com/vi/_PtelREnQqY/maxresdefault.jpg`

1280×720, and it happened to be a frame of the wall with notes on it. Useful for
cross-checking early frames.

**3. A Replit agent commit screenshot** — commit `f0b280b`

The Replit agent attached screenshots to its commits, and those Google Cloud Storage
URLs are still live. One of them caught the wall mid-session with a real note displayed.

## Pipeline

```
video (720p) → ffmpeg 2fps → 328 frames → cluster by similarity → 42 views
            → one frame per view → vision model OCR → dedupe → notes.json
```

Frames were read with `google/gemini-3.8-flash` via OpenRouter. Local `tesseract` runs
were used as a cross-check but the sticky-note font and colored backgrounds defeated it;
the vision model read them cleanly.

Each note was cross-referenced across every frame it appeared in. Where frames disagreed
on an emoji or a signature, the reading supported by the most frames won, and the
disagreement is noted in `notes.json`.

## Confidence levels

| Level | Meaning |
|---|---|
| `high` | Full text legible across multiple frames, cross-checked |
| `medium` | Legible but partially occluded; concatenated from several frames |
| `low` | Fragmentary — only part of the note ever appeared on camera |

Five notes are fragments. They were never fully on camera at any point in the recording,
so no amount of processing will complete them.

## What was ruled out

- **Neon Postgres database** — deleted with the Replit subscription. Replit's retention
  window is about a week; the lapse went unnoticed for months.
- **Replit support** — confirmed the data is unrecoverable.
- **Wayback Machine** — no snapshots of `warmfuzzywall.replit.app`,
  `warm-fuzzy-wall.replit.app`, or the Replit project page. The CDX index is empty.
- **The live deployment** — `warm-fuzzy-wall--geoppls.replit.app` still serves the UI on
  HTTP 200, but `/api/notes` returns 500 and `/api/notes/export` returns 400. The
  database connection is dead; only the frontend survived.
- **Git history** — checked every commit in `micahp/WarmFuzzyWall` for SQL dumps, CSVs,
  JSON exports, or seed data. Nothing was ever committed. The app never had a seed file;
  its "test mode" generated sample notes in memory at runtime.
- **Replit commit screenshots** — all 22 pulled and OCR'd. Only one shows real notes.

## The one thing that would still work

The app had an **Export** button that hit `/api/notes/export`, returning every note as
JSON to the browser. If that file is sitting in a Downloads folder somewhere, it's the
complete database and everything above becomes a backup.

`import_notes.py` will merge such an export into `notes.json` without clobbering the
video-recovered data — real rows upgrade partial findings in place, and notes that only
the video had are preserved.
