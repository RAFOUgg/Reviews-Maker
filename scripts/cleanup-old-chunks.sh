#!/bin/bash

###########################################################################
# Aggressive Old Chunks Cleanup
# Remove ALL known old artifact hashes
###########################################################################

DIST_DIR="/home/ubuntu/Reviews-Maker/client/dist"
ASSETS_DIR="$DIST_DIR/assets"

echo "==============================================="
echo "🗑️  AGGRESSIVE CLEANUP OF OLD CHUNKS"
echo "==============================================="
echo ""

# List what we're about to remove
echo "🔍 Old chunks to remove:"
echo ""

# Count what will be removed
TOTAL_REMOVE=0

echo "1️⃣  AccountSetup chunks:"
COUNT=$(find $ASSETS_DIR -name "*AccountSetup*" -type f 2>/dev/null | wc -l)
if [ $COUNT -gt 0 ]; then
    find $ASSETS_DIR -name "*AccountSetup*" -type f 2>/dev/null | while read f; do
        echo "  - $(basename $f)"
    done
    TOTAL_REMOVE=$((TOTAL_REMOVE + COUNT))
else
    echo "  ✅ None found"
fi

echo ""
echo "2️⃣  Old AccountPage hashes (Bs531fuh, COQ65J-f, etc):"
COUNT=$(find $ASSETS_DIR \( -name "*AccountPage-Bs*" -o -name "*AccountPage-COQ*" \) -type f 2>/dev/null | wc -l)
if [ $COUNT -gt 0 ]; then
    find $ASSETS_DIR \( -name "*AccountPage-Bs*" -o -name "*AccountPage-COQ*" \) -type f 2>/dev/null | while read f; do
        echo "  - $(basename $f)"
    done
    TOTAL_REMOVE=$((TOTAL_REMOVE + COUNT))
else
    echo "  ✅ None found"
fi

echo ""
echo "==============================================="

# Now delete them
echo ""
echo "🗑️  Removing old chunks..."

rm -f $ASSETS_DIR/*AccountSetup* 2>/dev/null
echo "✅ Deleted AccountSetup chunks"

rm -f $ASSETS_DIR/*AccountPage-Bs* 2>/dev/null
rm -f $ASSETS_DIR/*AccountPage-COQ* 2>/dev/null
echo "✅ Deleted old AccountPage hashes"

echo ""
echo "📁 Current AccountPage chunks:"
ls -lh $ASSETS_DIR/AccountPage* 2>/dev/null | awk '{print "  " $9, "(" $5 ")"}'

echo ""
echo "✅ CLEANUP COMPLETE"
echo ""
echo "🔄 Now restarting services..."
pm2 restart reviews-maker
sleep 3
pm2 status

echo ""
echo "📋 Service health:"
pm2 logs reviews-maker --lines 5
