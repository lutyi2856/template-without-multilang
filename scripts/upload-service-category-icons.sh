#!/bin/sh
# Uploads service category SVG icons to WordPress Media Library
# Icons: whitening.svg, prosthetics.svg, periodontics.svg, endodontics.svg
#
# Usage:
#   1. docker cp nextjs/src/icons/whitening.svg wp-{container}:/tmp/
#   2. docker cp nextjs/src/icons/prosthetics.svg wp-{container}:/tmp/
#   3. docker cp nextjs/src/icons/periodontics.svg wp-{container}:/tmp/
#   4. docker cp nextjs/src/icons/endodontics.svg wp-{container}:/tmp/
#   5. docker cp scripts/upload-service-category-icons.sh wp-{container}:/tmp/
#   6. docker exec wp-{container} sed -i "s/\r//" /tmp/upload-service-category-icons.sh
#   7. docker exec wp-{container} sh /tmp/upload-service-category-icons.sh

for slug in whitening prosthetics periodontics endodontics; do
  f="/tmp/${slug}.svg"
  [ -f "$f" ] || continue
  result=$(wp --allow-root media import "$f" --title="$slug" --porcelain 2>/dev/null)
  if [ -n "$result" ]; then
    echo "OK: $slug (ID: $result)"
  else
    echo "FAIL: $slug"
  fi
done
