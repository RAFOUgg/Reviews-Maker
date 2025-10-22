#!/usr/bin/env python3
"""Detect and optionally delete orphaned images in db/review_images.
Usage:
  python scripts/clean_review_images.py --db db/reviews.sqlite --images db/review_images --dry-run
  python scripts/clean_review_images.py --db db/reviews.sqlite --images db/review_images --delete
"""
import argparse
import os
import sqlite3
from pathlib import Path


def parse_args():
    p = argparse.ArgumentParser(description='Detect/delete orphaned images in db/review_images')
    p.add_argument('--db', default='db/reviews.sqlite')
    p.add_argument('--images', default='db/review_images')
    p.add_argument('--dry-run', action='store_true')
    p.add_argument('--delete', action='store_true')
    return p.parse_args()


def main():
    args = parse_args()
    db_path = Path(args.db)
    images_dir = Path(args.images)

    if not db_path.exists():
        print('DB not found at', db_path)
        return 2
    if not images_dir.exists():
        print('Images dir not found at', images_dir)
        return 2

    print('DB:', db_path)
    print('Images dir:', images_dir)
    mode = 'dry-run' if args.dry_run or not args.delete else 'delete'
    print('Mode:', mode)

    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    referenced = set()

    for row in cur.execute('SELECT imagePath, data FROM reviews'):
        imagePath, data = row
        if imagePath:
            referenced.add(Path(imagePath).name)
        if data:
            try:
                import json
                d = json.loads(data)
            except Exception:
                d = None
            if isinstance(d, dict):
                for key in ('image', 'imagePath', 'img'):
                    v = d.get(key)
                    if v:
                        referenced.add(Path(str(v)).name)

    orphans = []
    for f in images_dir.iterdir():
        if not f.is_file():
            continue
        if f.name not in referenced:
            orphans.append(f.name)

    print('\nFound', len(orphans), 'orphaned images:')
    for o in orphans:
        print(' ', o)

    if len(orphans) == 0:
        print('Nothing to do.')
        return 0

    if args.delete:
        for o in orphans:
            p = images_dir / o
            try:
                p.unlink()
                print('Deleted', o)
            except Exception as e:
                print('Failed to delete', o, e)
    else:
        print('\nDry-run mode: no files were deleted. To remove them, run with --delete')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
