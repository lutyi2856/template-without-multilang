#!/bin/sh
# Uploads guarantee-shield.svg and guarantee-badge.svg to WordPress Media Library
#
# Usage:
#   1. docker cp nextjs/src/icons/guarantee-shield.svg wp-{container}:/tmp/
#   2. docker cp nextjs/src/icons/guarantee-badge.svg wp-{container}:/tmp/
#   3. docker cp scripts/upload-guarantee-icon.sh wp-{container}:/tmp/
#   4. docker exec wp-{container} sed -i "s/\r//" /tmp/upload-guarantee-icon.sh
#   5. docker exec wp-{container} sh /tmp/upload-guarantee-icon.sh

for f in /tmp/guarantee-*.svg; do
  [ -f "$f" ] || continue
  slug=$(basename "$f" .svg)
  result=$(wp --allow-root media import "$f" --title="$slug" --porcelain 2>/dev/null)
  if [ -n "$result" ]; then
    echo "OK: $slug (ID: $result)"
  else
    echo "FAIL: $slug"
  fi
done
