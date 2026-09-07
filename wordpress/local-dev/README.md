# Local WordPress for the plugin

A throwaway WordPress on **http://localhost:8080** with `sdgc-front9` installed,
activated, and the four shortcode pages already created. For checking the plugin
by hand — not a deployment target.

Needs Docker. Nothing else: no PHP, no MySQL, no wp-cli on the host.

```bash
cd wordpress/local-dev
./up.sh
```

First run pulls the images and takes a couple of minutes. After that it's seconds.

| | |
|---|---|
| Site | http://localhost:8080/ |
| Admin | http://localhost:8080/wp-admin/ — `admin` / `admin` |
| Leagues | http://localhost:8080/leagues/ |
| League | http://localhost:8080/league/?league=`<slug>` |
| Event | http://localhost:8080/event/?event=`<slug>` |
| Rankings | http://localhost:8080/rankings/ |

Use a different port with `PORT=9000 ./up.sh`.

## Editing the plugin

`wordpress/sdgc-front9/` is bind-mounted into the container, so a saved edit is
live on the next page load. No rebuild, no re-copy, no re-activate. The same
goes for `local-dev/mu-plugins/`.

A plain browser reload is enough, including for CSS. The plugin enqueues its
assets at a fixed `SDGC_FRONT9_VERSION`, which is right for production but means
the browser keeps serving the stylesheet it already has while you're editing —
an edit looks like it did nothing. The mu-plugin re-stamps the plugin's CSS and
JS with the file's modification time locally, so the URL changes whenever you
save and the browser refetches. (If you ever do need to force it: Ctrl+Shift+R,
or Cmd+Shift+R on a Mac.)

The one thing that doesn't update instantly is API data: responses are cached in
a transient for five minutes. To see a Front9 change immediately:

```bash
docker exec sdgc-wp-site php -r 'define("WP_USE_THEMES",false); require "/var/www/html/wp-load.php";
  global $wpdb; $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE \"_transient%sdgc_f9%\"");'
```

## Stopping

```bash
./down.sh           # stop; the site and its database survive
./down.sh --clean   # delete containers, database and wp-content — up.sh rebuilds from scratch
```

## Watching for errors

`WP_DEBUG` is on and logging to a file rather than the page:

```bash
docker exec sdgc-wp-site cat /var/www/html/wp-content/debug.log   # PHP warnings from the plugin
docker logs -f sdgc-wp-site                                        # Apache access + error log
```

If `debug.log` doesn't exist, nothing has warned yet.

## What up.sh checks on the way out

- **GD extension** — without it every league falls back to the brand red instead
  of reading an accent out of its crest.
- **Front9 API reachable** — if this says no, the pages render their empty
  states, which is correct behaviour, not a bug.

## Full-width pages

The plugin's install notes assume each page uses a **full-width, no-sidebar
template**. Twenty Twenty-Five doesn't ship one: it wraps page content in
`is-layout-constrained` containers that clamp every child to 645px, so the
shortcodes render in a narrow column.

`mu-plugins/sdgc-local-fullwidth.php` supplies that container locally. It only
touches pages carrying one of the four shortcodes, and it does three things:
drops the theme's max-width and side padding, cancels the negative margins the
theme uses to offset that padding, and hides the theme's page title (the plugin
renders its own hero heading).

**This is harness scaffolding and must not ship with the plugin.** On the real
site the same job belongs to a full-width page template in the theme. If the
production theme has no such template, that gap has to be closed there — the
plugin deliberately doesn't fight its host theme's layout.

## Notes on what you'll see

The theme is stock Twenty Twenty-Five, so the page chrome is not the real site's.
The plugin only renders page bodies — header, footer and nav belong to the theme
on the live site.

At 1280px and up the league grid is four fixed columns, so a single published
league occupies a quarter of the row. That's the grid, not a width bug.

Leagues drop off `/leagues/` a month after their end date, by design. If the page
looks empty, check the API directly:

```bash
curl -s https://api.front9.com/api/public/v1/orgs/seth-dichard-golf-centers/event-series | python3 -m json.tool
```

The event page's five tabs are Front9 `<script>` embeds from `front9.com`, so
they need working internet in the browser, not just in the container.
