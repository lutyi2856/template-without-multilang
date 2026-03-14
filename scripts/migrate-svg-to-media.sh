#!/bin/bash
# Migrate existing SVG icons from nextjs/src/icons/ to WordPress Media Library
# Run: docker exec wp-new-wordpress bash /var/www/html/scripts/migrate-svg-to-media.sh

ICONS_DIR="/var/www/html/nextjs-icons"
WP="wp --allow-root"

if [ ! -d "$ICONS_DIR" ]; then
  echo "Error: $ICONS_DIR not found. Copy SVGs first."
  exit 1
fi

IMPORTED=0
SKIPPED=0

for SVG_FILE in "$ICONS_DIR"/*.svg; do
  [ -f "$SVG_FILE" ] || continue

  FILENAME=$(basename "$SVG_FILE")
  SLUG="${FILENAME%.svg}"

  # Check if already imported (by filename)
  EXISTING=$($WP post list --post_type=attachment --post_mime_type='image/svg+xml' --field=post_title --format=csv 2>/dev/null | grep -i "^${SLUG}$")

  if [ -n "$EXISTING" ]; then
    echo "SKIP: $SLUG (already exists)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Import SVG
  RESULT=$($WP media import "$SVG_FILE" --title="$SLUG" --porcelain 2>/dev/null)

  if [ -n "$RESULT" ]; then
    echo "OK: $SLUG (ID: $RESULT)"
    IMPORTED=$((IMPORTED + 1))
  else
    echo "FAIL: $SLUG"
  fi
done

echo ""
echo "Done: $IMPORTED imported, $SKIPPED skipped"
