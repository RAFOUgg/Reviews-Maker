#!/bin/bash

echo "🔍 Checking index.html for old chunk references..."
echo ""

DIST_HTML="/home/ubuntu/Reviews-Maker/client/dist/index.html"

echo "Old chunks to search for:"
grep -o 'AccountSetup[^"]*' "$DIST_HTML" 2>/dev/null && echo "❌ Found old AccountSetup reference!" || echo "✅ No AccountSetup references found"

echo ""
echo "Old AccountPage hashes to search for:"
grep -o 'AccountPage-Bs[^"]*\|AccountPage-COQ[^"]*' "$DIST_HTML" 2>/dev/null && echo "❌ Found old AccountPage hash!" || echo "✅ No old AccountPage hashes found"

echo ""
echo "All script references in index.html:"
grep -o '<script[^>]*src="[^"]*"' "$DIST_HTML" | head -20

echo ""
echo "Looking for account-related imports:"
grep -i 'account\|setup' "$DIST_HTML" | head -20
