#!/usr/bin/env python3
"""
Merge a WarmFuzzyWall database export into recovered/notes.json.

The original app had an Export button that hit `/api/notes/export` and returned
{"notes": [...]} straight to the browser. If that file turns up, this script
reconciles it against what was recovered from video — real database rows always
win, but anything only found in the video is preserved rather than dropped.

Usage:
    python3 import_notes.py /path/to/warm-fuzzies-export.json
    python3 import_notes.py export.json --out recovered/notes.json
"""
import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_OUT = os.path.join(HERE, 'notes.json')


def norm(s):
    """Normalize for fuzzy comparison: lowercase, collapse whitespace, strip punctuation."""
    if not s:
        return ''
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s]', '', s)
    return re.sub(r'\s+', ' ', s).strip()


def looks_partial(text):
    return text.startswith('…') or text.endswith('…') or '…' in text[:3]


def overlap(a, b):
    """Fraction of the shorter normalized string contained in the longer one."""
    na, nb = norm(a), norm(b)
    if not na or not nb:
        return 0.0
    short, long_ = (na, nb) if len(na) <= len(nb) else (nb, na)
    return 1.0 if short in long_ else 0.0


def load_export(path):
    """Accept either {"notes": [...]} or a bare [...] list."""
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, dict):
        rows = data.get('notes') or data.get('data') or []
    elif isinstance(data, list):
        rows = data
    else:
        sys.exit('Unrecognized export shape')
    if not rows:
        sys.exit('Export contained no notes')
    return rows


def row_text(r):
    for k in ('text', 'content', 'message', 'body', 'note'):
        if r.get(k):
            return r[k]
    return ''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('export', help='path to the JSON export')
    ap.add_argument('--out', default=DEFAULT_OUT)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    rows = load_export(args.export)
    with open(args.out) as f:
        existing = json.load(f)

    matched = 0
    added = 0
    upgraded = 0
    next_id = max((n['id'] for n in existing['notes']), default=0) + 1

    for r in rows:
        text = row_text(r)
        if not text:
            continue
        hit = None
        for n in existing['notes']:
            if overlap(text, n['text']) >= 0.85:
                hit = n
                break

        if hit:
            matched += 1
            # Real DB row wins. Keep provenance.
            if looks_partial(hit['text']) or hit['confidence'] != 'high':
                hit['text'] = text.strip()
                hit['confidence'] = 'high'
                hit['source'] = 'original database export'
                hit['replaces'] = 'partial video recovery'
                upgraded += 1
            hit['author'] = r.get('author') or hit.get('author')
            hit['recipient'] = r.get('recipient') or hit.get('recipient')
            if r.get('createdAt'):
                hit['created_at'] = r['createdAt']
        else:
            existing['notes'].append({
                'id': next_id,
                'recipient': r.get('recipient'),
                'author': r.get('author'),
                'date': r.get('createdAt'),
                'text': text.strip(),
                'confidence': 'high',
                'source': 'original database export',
            })
            next_id += 1
            added += 1

    existing['meta']['notes_recovered'] = len(existing['notes'])
    existing['meta']['status'] = 'DATABASE EXPORT MERGED — full original data recovered'
    existing['meta'].setdefault('merge_history', []).append({
        'source_file': os.path.basename(args.export),
        'rows_in_export': len(rows),
        'matched_existing': matched,
        'upgraded_partials': upgraded,
        'newly_added': added,
    })

    print(f'{len(rows)} rows in export')
    print(f'  matched existing recovered notes : {matched}')
    print(f'  upgraded partial -> full text    : {upgraded}')
    print(f'  newly added                      : {added}')
    print(f'  total notes now                  : {len(existing["notes"])}')

    if args.dry_run:
        print('(dry run, nothing written)')
        return
    with open(args.out, 'w') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    print(f'wrote {args.out}')
    print('\nNow regenerate the README with: python3 render_readme.py')


if __name__ == '__main__':
    main()
