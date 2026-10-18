#!/usr/bin/env python3
"""Render recovered/notes.json into README.md. Run after import_notes.py changes the data."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


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

    full = [n for n in d['notes'] if n['confidence'] != 'low' and not n['text'].startswith('…')]
    frag = [n for n in d['notes'] if n not in full]

    out = []
    out.append('# Warm and Fuzzies Wall — Recovered Notes')
    out.append('')
    out.append(f"**{d['meta'].get('subject', '')}.** Recovered {d['meta']['recovered_on']}.")
    out.append('')
    out.append(f"**{len(d['notes'])} notes recovered** "
               f"({len(full)} complete or near-complete, {len(frag)} fragments).")
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
        out.append('## Fragments')
        out.append('')
        out.append('Only these parts were ever visible on camera. The rest is gone.')
        out.append('')
        for n in frag:
            out.append(block(n))

    with open(os.path.join(HERE, 'README.md'), 'w') as f:
        f.write('\n'.join(out))
    print(f"wrote README.md ({len(full)} complete, {len(frag)} fragments)")


if __name__ == '__main__':
    main()
