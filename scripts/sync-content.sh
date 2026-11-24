#!/usr/bin/env bash
# Copies the apps' content that the site reads (the library and tafsirs, their covers, and
# the Quranpedia study data, rebuilt per surah from the apps' database) to the server, in the apps' own layout, so the site and the
# apps serve the same bytes. Run after the apps' content changes:
#   scripts/sync-content.sh [path to dhikr-app]
set -euo pipefail
SRC="${1:-$HOME/Developer/dhikr/dhikr-app}"
DEST="Abdeljawad:/opt/dhikr-content"
ssh Abdeljawad 'mkdir -p /opt/dhikr-content/app/assets/data /opt/dhikr-content/app/assets/images'
rsync -az --delete "$SRC/app/assets/data/library/" "$DEST/app/assets/data/library/"
rsync -az --delete "$SRC/app/assets/images/library/" "$DEST/app/assets/images/library/"
# The hadith collections.
rsync -rlt --compress --delete "$SRC/app/assets/data/hadith/" "$DEST/app/assets/data/hadith/"
# The thematic encyclopedia, as the masahif app ships it.
ssh Abdeljawad 'mkdir -p /opt/dhikr-content/masahif_app/assets/data/library'
rsync -rlt --compress --delete "$SRC/masahif_app/assets/data/library/mawsuah/" "$DEST/masahif_app/assets/data/library/mawsuah/"
# The Quranpedia study pages read a per-surah build of the apps' database.
QP="$(mktemp -d)"
node --no-warnings "$(dirname "$0")/build-quranpedia.mjs" "$SRC" "$QP"
rsync -rlt --compress --delete "$QP/" "$DEST/quranpedia/"
rm -rf "$QP"
# Readable by the site whatever the copies' modes were here (macOS rsync has no --chmod).
ssh Abdeljawad 'chmod -R u=rwX,go=rX /opt/dhikr-content/quranpedia /opt/dhikr-content/masahif_app /opt/dhikr-content/app/assets/data/hadith'
# The open prayer-times dataset's downloads (CSV, JSON, SQLite), built from the apps' tables.
PT="$(mktemp -d)"
node --no-warnings "$(dirname "$0")/build-prayer-libya.mjs" "$SRC" --out "$PT" >/dev/null
rsync -rlt --compress --delete "$PT/" "$DEST/prayer/"
rm -rf "$PT"
ssh Abdeljawad 'chmod -R u=rwX,go=rX /opt/dhikr-content/prayer'
# The tafsirs folded into Postgres for search (skipped when the files are unchanged).
ssh Abdeljawad 'cd /opt/dhikr-site/src && set -a && . ./.env.production && set +a && node scripts/index-tafsir.mjs'
echo "synced from $SRC ($(cd "$SRC" && git rev-parse --short HEAD 2>/dev/null || echo 'no git'))"
