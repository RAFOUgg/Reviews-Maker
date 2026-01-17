#!/bin/bash

echo "🔍 Searching for OLD chunk files in dist/assets..."
echo ""

DIST_DIR="/home/ubuntu/Reviews-Maker/client/dist/assets"

echo "Looking for AccountSetup chunks:"
find $DIST_DIR -name "*AccountSetup*" -type f 2>/dev/null | while read file; do
    ls -lh "$file"
done

echo ""
echo "Looking for old AccountPage hashes (Bs, COQ, etc):"
find $DIST_DIR -name "*AccountPage-Bs*" -o -name "*AccountPage-COQ*" 2>/dev/null | while read file; do
    ls -lh "$file"
done

echo ""
echo "All AccountPage chunks found:"
find $DIST_DIR -name "*AccountPage*" -type f 2>/dev/null | while read file; do
    ls -lh "$file"
done

echo ""
echo "Counting total JS chunks:"
find $DIST_DIR -type f -name "*.js" 2>/dev/null | wc -l

echo ""
echo "✅ Script ready - execute on VPS with:"
echo "bash ~/Reviews-Maker/scripts/find-old-chunks.sh"
