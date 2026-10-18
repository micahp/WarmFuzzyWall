#!/usr/bin/env python3
"""Render recovered/notes.json into README.md. Run after import_notes.py changes the data."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

FRONT = """# Warm and Fuzzies Wall — Recovered Notes

**Micah's 30th birthday wall.** Originally a Replit app (`WarmFuzzyWall`) backed by a
Neon Postgres database provisioned through Replit. When the Replit subscription lapsed,
the database was deleted. Replit's retention window is about a week, and the lapse went
unnoticed for months, so the data was gone before anyone could export it.

This is what survived.

Recovered from the [YouTube demo video](https://youtu.be/_PtelREnQqY), its thumbnail, a
screenshot the Replit agent attached to a commit, and a screenshot of the live wall.

---
"""

BACK = """---

## What didn't get recovered

The video is a two-minute demo, not an exhaustive capture. It only shows what Micah
happened to scroll past. The app paginated at 12 notes per page, so the original wall
was almost certainly larger than what's here.

**Dead ends, all confirmed:**

- **Neon Postgres database** — deleted with the subscription. ~1 week retention, expired by months.
- **Replit support** — confirmed unrecoverable.
- **Wayback Machine** — zero snapshots. The site was a client-side app that crawlers never captured.
- **The live deployment** — `warm-fuzzy-wall--geoppls.replit.app` still serves the UI, but `/api/notes` returns 500. The database connection is dead.
- **Git history** — no dumps, exports, or seed data were ever committed. Verified against every commit.

## Places left to look

1. **Your Downloads folder.** The app had an Export button hitting `/api/notes/export` that returned the entire database as JSON to the browser. If you ever clicked it, that file has everything and this document is obsolete.
2. **Your camera roll / Google Photos.** You built this for your birthday — you probably screenshotted it.
3. **Group chats.** Anyone who screenshotted their own note is a direct source. One screenshot already recovered a note the video never showed.
4. **The named authors.** Hope, Mani, Allie, JD, TB, Crystal Gravy, Sarang, Jeff Dudan, Margrit Pez. They wrote these — they can confirm the text and may have their own copies.

If an export turns up, `import_notes.py` will merge it with what's here instead of
overwriting, and `render_readme.py` will regenerate this document.
"""


def block(n):
    lines = []
    head = []
    if n.get('recipient'):
        head.append(f"To: {n['recipient']}")
    if n.get('author'):
        head.append(n['author'])
    if n.get('date'):
        head.append(n['date'])
    title = ' — '.join(head) if head else f"Note {n['id']}"
    lines.append(f"### {n['id']}. {title}")
    lines.append('')
    for para in n['text'].split('\n'):
        lines.append(f'> {para}' if para.strip() else '>')
    lines.append('')
    if n.get('author'):
        lines.append(f"— **{n['author']}**")
        lines.append('')
    for extra in ('recovery_note', 'note', 'author_uncertain'):
        if n.get(extra):
            lines.append(f"*{n[extra]}*")
            lines.append('')
    return '\n'.join(lines)


def main():
    with open(os.path.join(HERE, 'notes.json')) as f:
        d = json.load(f)

    full = [n for n in d['notes'] if n['confidence'] == 'high']
    frag = [n for n in d['notes'] if n['confidence'] != 'high']
    full.sort(key=lambda n: n['id'])
    frag.sort(key=lambda n: n['id'])

    out = [FRONT, '']
    out.append(f"**{len(d['notes'])} notes recovered** "
               f"({len(full)} complete, {len(frag)} clipped at a frame edge).")
    out.append('')
    out.append('---')
    out.append('')
    out.append('## Complete notes')
    out.append('')
    for n in full:
        out.append(block(n))
    if frag:
        out.append('---')
        out.append('')
        out.append('## Clipped notes')
        out.append('')
        out.append('Most of each of these was recovered, but they open or close mid-sentence at a '
                   'frame edge. The missing words were never on screen in any surviving source.')
        out.append('')
        for n in frag:
            out.append(block(n))
    out.append(BACK)

    with open(os.path.join(HERE, 'README.md'), 'w') as f:
        f.write('\n'.join(out))
    print(f"wrote README.md ({len(full)} complete, {len(frag)} fragments, {len(d['notes'])} total)")


if __name__ == '__main__':
    main()
