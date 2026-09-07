#!/usr/bin/env bash
#
# Stop the local WordPress. With --clean, also delete the containers,
# the database and the wp-content volume, so ./up.sh starts from scratch.

set -euo pipefail

NET=sdgc-wp
DB=sdgc-wp-db
SITE=sdgc-wp-site

docker stop "$SITE" "$DB" >/dev/null 2>&1 || true
echo "Stopped."

if [ "${1:-}" = "--clean" ]; then
  docker rm -f "$SITE" "$DB" >/dev/null 2>&1 || true
  docker volume rm sdgc-wp-dbdata sdgc-wp-content >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
  echo "Cleaned — containers, database and wp-content removed."
fi
