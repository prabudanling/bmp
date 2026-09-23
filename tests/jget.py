#!/usr/bin/env python3
"""jget.py — ambil nilai dari JSON stdin lewat path ringkas.
Pemakaian:  echo '{"a":{"b":1}}' | python3 jget.py "['a']['b']"
Output: nilai / None / '' bila input rusak."""
import sys
import json

try:
    d = json.load(sys.stdin)
    cur = d
    for part in sys.argv[1].split(']['):
        part = part.strip("[]'\"")
        if part == '':
            continue
        if isinstance(cur, list):
            cur = cur[int(part)]
        elif isinstance(cur, dict):
            cur = cur.get(part)
        else:
            cur = None
        if cur is None:
            break
    if cur is None:
        print('None')
    else:
        print(cur)
except Exception:
    print('')
