#!/usr/bin/env bash
#
# Spin up a throwaway WordPress on http://localhost:8080 with the
# SDGC Leagues & Rankings plugin installed, activated, and the four
# shortcode pages already created.
#
# The plugin directory is bind-mounted, so editing files in
# wordpress/sdgc-front9/ shows up on the next page load — no rebuild.

set -euo pipefail

PORT="${PORT:-8080}"
NET=sdgc-wp
DB=sdgc-wp-db
SITE=sdgc-wp-site
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$HERE/.." && pwd)/sdgc-front9"
MU_DIR="$HERE/mu-plugins"

DB_NAME=wordpress
DB_USER=wordpress
DB_PASS=wordpress
DB_ROOT=root

WP_URL="http://localhost:${PORT}"
WP_ADMIN=admin
WP_ADMIN_PASS=admin
WP_ADMIN_EMAIL=admin@example.com

say() { printf '\n\033[1;32m==>\033[0m %s\n' "$1"; }

[ -d "$PLUGIN_DIR" ] || { echo "Plugin not found at $PLUGIN_DIR" >&2; exit 1; }

# wp-cli, run against the site container's filesystem.
wp() {
  # The image's wp-config.php reads DB settings from the environment, so the
  # cli container needs the same vars the site container was started with.
  docker run --rm --network "$NET" --volumes-from "$SITE" -u 33:33 \
    -e WP_CLI_CACHE_DIR=/tmp/wp-cli-cache \
    -e WORDPRESS_DB_HOST="$DB" \
    -e WORDPRESS_DB_NAME="$DB_NAME" \
    -e WORDPRESS_DB_USER="$DB_USER" \
    -e WORDPRESS_DB_PASSWORD="$DB_PASS" \
    wordpress:cli wp --path=/var/www/html "$@"
}

say "Network"
docker network inspect "$NET" >/dev/null 2>&1 || docker network create "$NET"

say "Database ($DB)"
if [ -n "$(docker ps -aq -f name="^${DB}$")" ]; then
  docker start "$DB" >/dev/null
else
  docker run -d --name "$DB" --network "$NET" \
    -e MARIADB_DATABASE="$DB_NAME" \
    -e MARIADB_USER="$DB_USER" \
    -e MARIADB_PASSWORD="$DB_PASS" \
    -e MARIADB_ROOT_PASSWORD="$DB_ROOT" \
    -v sdgc-wp-dbdata:/var/lib/mysql \
    mariadb:11 >/dev/null
fi

say "WordPress ($SITE) on port $PORT"
if [ -n "$(docker ps -aq -f name="^${SITE}$")" ]; then
  docker start "$SITE" >/dev/null
else
  docker run -d --name "$SITE" --network "$NET" \
    -p "${PORT}:80" \
    -e WORDPRESS_DB_HOST="$DB" \
    -e WORDPRESS_DB_NAME="$DB_NAME" \
    -e WORDPRESS_DB_USER="$DB_USER" \
    -e WORDPRESS_DB_PASSWORD="$DB_PASS" \
    -e WORDPRESS_DEBUG=1 \
    -e WORDPRESS_CONFIG_EXTRA="define('WP_DEBUG_LOG', true); define('WP_DEBUG_DISPLAY', false);" \
    -v sdgc-wp-content:/var/www/html/wp-content \
    -v "${PLUGIN_DIR}:/var/www/html/wp-content/plugins/sdgc-front9" \
    -v "${MU_DIR}:/var/www/html/wp-content/mu-plugins" \
    wordpress:php8.3-apache >/dev/null
fi

say "Waiting for the database"
for i in $(seq 1 60); do
  docker exec "$DB" mariadb-admin ping -h127.0.0.1 -uroot -p"$DB_ROOT" --silent >/dev/null 2>&1 && break
  sleep 2
  [ "$i" = 60 ] && { echo "Database never came up" >&2; exit 1; }
done

say "Waiting for WordPress files"
for i in $(seq 1 60); do
  docker exec "$SITE" test -f /var/www/html/wp-settings.php >/dev/null 2>&1 && break
  sleep 2
  [ "$i" = 60 ] && { echo "WordPress never unpacked" >&2; exit 1; }
done

if wp core is-installed >/dev/null 2>&1; then
  say "WordPress already installed — reusing it"
else
  say "Installing WordPress"
  wp core install \
    --url="$WP_URL" \
    --title="SDGC Local" \
    --admin_user="$WP_ADMIN" \
    --admin_password="$WP_ADMIN_PASS" \
    --admin_email="$WP_ADMIN_EMAIL" \
    --skip-email
fi

say "Pretty permalinks"
wp rewrite structure '/%postname%/' --hard >/dev/null
wp rewrite flush --hard >/dev/null

say "Activating the plugin"
wp plugin activate sdgc-front9

say "Creating the shortcode pages"
make_page() { # slug, title, shortcode
  if [ -z "$(wp post list --post_type=page --name="$1" --field=ID 2>/dev/null)" ]; then
    wp post create --post_type=page --post_status=publish \
      --post_name="$1" --post_title="$2" --post_content="$3" >/dev/null
    echo "  created /$1/"
  else
    echo "  /$1/ already there"
  fi
}
make_page leagues  "Leagues"               "[sdgc_leagues]"
make_page league   "League"                "[sdgc_league]"
make_page event    "Event"                 "[sdgc_event]"
make_page rankings "Indoor Golf Rankings"  "[sdgc_rankings]"
make_page blog     "Blog"                  "[sdgc_blog]"

# Leave the front page alone: the plugin's leagues_page option points at
# /leagues/, and making it the site's front page would 301 that path away.
wp option update show_on_front posts >/dev/null

say "Sanity checks"
printf '  GD extension: '
docker exec "$SITE" php -r 'echo extension_loaded("gd") ? "yes\n" : "NO — accent colours will fall back to brand red\n";'
printf '  Front9 API reachable from the container: '
docker exec "$SITE" php -r '
$ctx = stream_context_create(array("http" => array("timeout" => 10, "ignore_errors" => true)));
$body = @file_get_contents("https://api.front9.com/api/public/v1/orgs/seth-dichard-golf-centers/event-series", false, $ctx);
$data = json_decode((string) $body, true);
echo is_array($data) ? "yes (" . count($data) . " leagues)\n" : "no — pages will show their empty states\n";
' 2>/dev/null || echo "no"

cat <<MSG

  Site       ${WP_URL}/
  Admin      ${WP_URL}/wp-admin/   (${WP_ADMIN} / ${WP_ADMIN_PASS})

  Leagues    ${WP_URL}/leagues/
  League     ${WP_URL}/league/?league=<slug>
  Event      ${WP_URL}/event/?event=<slug>
  Rankings   ${WP_URL}/rankings/
  Blog       ${WP_URL}/blog/?id=<slug>

  Plugin files are live-mounted from wordpress/sdgc-front9/ — just reload.
  Logs:  docker logs -f ${SITE}
  Stop:  ./down.sh          Wipe and start over:  ./down.sh --clean

MSG
