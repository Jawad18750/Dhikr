#!/usr/bin/env bash
# Copies the apps' content that the site reads (the library, its covers, and later the
# tafsirs and Quranpedia data) to the server, in the apps' own layout, so the site and the
# apps serve the same bytes. Run after the apps' content changes:
#   scripts/sync-content.sh [path to dhikr-app]
set -euo pipefail
SRC="${1:-$HOME/Developer/dhikr/dhikr-app}"
DEST="Abdeljawad:/opt/dhikr-content"
ssh Abdeljawad 'mkdir -p /opt/dhikr-content/app/assets/data /opt/dhikr-content/app/assets/images'
rsync -az --delete "$SRC/app/assets/data/library/" "$DEST/app/assets/data/library/"
rsync -az --delete "$SRC/app/assets/images/library/" "$DEST/app/assets/images/library/"
echo "synced from $SRC ($(cd "$SRC" && git rev-parse --short HEAD 2>/dev/null || echo 'no git'))"
