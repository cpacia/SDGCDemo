# SDGC Leagues & Rankings — WordPress build

The four pages from the Next.js prototype, rebuilt as a WordPress plugin: the
**leagues home page**, a **league page**, an **event page**, and the
**indoor golf rankings page**.

Only the page bodies are here. Header, footer, nav and the site chrome all stay
with the theme — each page is a normal WordPress page with one shortcode in it.

Everything on these pages is read live from the Front9 public API, so a new
league appears on the site the moment it's published, with no edits here.

---

## Install

1. Copy `sdgc-front9/` into `wp-content/plugins/` on the site.
2. **Plugins → Installed Plugins → SDGC Leagues & Rankings (Front9) → Activate.**
3. Create four pages and put one shortcode in each (a Shortcode block, or plain
   text in the Classic editor):

   | Page | Suggested slug | Shortcode |
   |---|---|---|
   | Leagues | `/leagues/` | `[sdgc_leagues]` |
   | League | `/league/` | `[sdgc_league]` |
   | Event | `/event/` | `[sdgc_event]` |
   | Indoor Golf Rankings | `/rankings/` | `[sdgc_rankings]` |

4. If you used different slugs, tell the plugin where the pages are — see
   **Configuration** below. The league cards and the schedule widget link to
   these pages, so the paths have to match.

Give each page a full-width, no-sidebar template if the theme has one. The pages
manage their own width (85%, maxing out at 1180px) and expect to sit in a full
bleed container.

### The League and Event pages are single, reusable pages

They aren't one page per league. The League page reads `?league=<slug>` and the
Event page reads `?event=<slug>`, which is what the cards and widgets link with:

```
/league/?league=thursday-night-family-friends-league
/event/?event=2026-the-turkey-day-shootout
```

To pin one league to its own permanent page instead, pass the slug directly:

```
[sdgc_league slug="thursday-night-family-friends-league"]
```

---

## Configuration

Defaults live in `sdgc_front9_options()`. Override any of them from the theme's
`functions.php` (or a small site plugin) — nothing in the plugin needs editing:

```php
add_filter( 'sdgc_front9_options', function ( $options ) {
	// Where you actually put the pages.
	$options['leagues_page']  = '/indoor-golf-leagues/';
	$options['league_page']   = '/indoor-golf-leagues/league/';
	$options['event_page']    = '/indoor-golf-leagues/event/';
	$options['rankings_page'] = '/indoor-golf-rankings/';

	// Hero photo — a media-library URL is fine.
	$options['hero_image']    = 'https://sethdichardgolf.com/wp-content/uploads/hero.jpg';

	// Contact details on the league page buttons.
	$options['phone']         = '(603) 860-9893';
	$options['phone_href']    = 'tel:+16038609893';
	$options['book_now']      = 'https://sethdichardgolf.com/book-now/';

	return $options;
} );
```

Other keys: `org`, `api`, `embed`, `rankings_series`, `accent`, `cache_ttl`.

**Fonts.** The design uses Oswald and Poppins, pulled from Google Fonts. If the
theme already loads them, turn the plugin's copy off:

```php
add_filter( 'sdgc_front9_load_fonts', '__return_false' );
```

**Copy.** The rankings rules, the ranking facts and the stat strip are filterable
too: `sdgc_front9_ranking_rules`, `sdgc_front9_ranking_facts`,
`sdgc_front9_league_stats`.

---

## What each page does

**`[sdgc_leagues]`** — hero, a strip of live figures (active leagues and total
roster, both counted from the API), the league card grid, the rankings promo, and
the blog + tournament schedule widgets.

**`[sdgc_league]`** — the league's crest, name and blurb; a Register button; a
fact strip (plays / format / season / entry); and the league's own schedule and
standings widgets.

The Register button is live. It posts to the API, which mints a hosted
registration URL, and the golfer is redirected there to pick a partner and pay.
Payment never touches this site. The button only appears while a league is
actually taking sign-ups — the other states render as plain text, because there's
nowhere to send anyone:

| League state | Button |
|---|---|
| Taking sign-ups | **Register — 6 Spots Open** (live) |
| Roster full | **League Full — Join Waitlist** (live) |
| Registration not open yet | Registration Opens Sep 3 |
| Sign-ups closed, season not started | Registration Closed |
| Season underway | Season Underway — Ask About Next Season |
| Season over | Season Complete |

**`[sdgc_event]`** — the event's real title and date/course from the API, then
five tabs (Details, Field, Tee Times, Leaderboard, Odds). Each tab is a Front9
widget, loaded the first time you open it rather than all five at once. Tabs are
linkable: `/event/?event=<slug>#leaderboard`.

**`[sdgc_rankings]`** — the facility-wide standings table with the "how it works"
rules alongside.

---

## How the data works

Every read hits the Front9 public API, unauthenticated, and is cached in a
WordPress transient for five minutes (`cache_ttl`). If Front9 is unreachable the
pages render their empty states rather than erroring — a league list with nothing
in it, an event page with the slug-derived title.

The league cards and league pages present the API's own fields:

- **The bottom line of each card** comes from the league's dates and roster:
  `6 SPOTS OPEN`, `FULL · 24 TEAMS`, `OPENS SEP 3`, `SEASON UNDERWAY · 24 TEAMS`,
  `SEASON COMPLETE`. Only a genuine invitation is red; the rest are grey.
- **Finished leagues stay up for one month** past their end date, then drop off
  by themselves.
- **"Plays"** uses the league's Schedule field ("Thursdays: 7:00-9:30") when an
  admin has set one, and falls back to the weekday of the first night otherwise.
- **The schedule and standings widgets are bound to the league by slug**, so
  neither this site nor an admin has to maintain event tags or standings-table
  ids.
- **Each league's accent colour is read from its own crest** — the card's top
  rule, and the league page's format line and hero rule. A greyscale logo (the
  stock "league photo coming soon" placeholder is one) has no colour to infer, so
  those fall back to the brand red. Crests are decoded with GD and the result is
  cached for a week; a re-upload lands on a new versioned URL, which re-reads it.

Nothing here is a copy of league data — change a league in Front9 and the site
follows within five minutes.

---

## Troubleshooting

**The widgets don't appear.** They're `<script>` tags from `front9.com`. A script
optimiser (Autoptimize, WP Rocket, LiteSpeed) that defers or combines inline
scripts will break them, because the loader reads its own tag's position to know
where to put the iframe. Exclude `front9.com/embed.js` from combining/deferring.

**The cards link to the wrong page.** The `league_page` and `event_page` options
don't match where the pages actually live — see Configuration.

**A league is missing.** The API only publishes leagues that are open, active or
completed; drafts and private leagues never leave Front9. A league that ended more
than a month ago is dropped on purpose.

**Nothing updates after a change in Front9.** Responses are cached for five
minutes. Lower `cache_ttl` if you need it snappier while setting things up.

**The layout looks off.** The theme may be constraining the page. Use a
full-width template; the pages handle their own gutters.

**Every league is the same red.** Accent colours need the GD extension (`php -m |
grep gd`). Without it the pages still work, they just use the brand colour
throughout. The same happens for a crest with no saturated colour in it.

---

## Files

```
sdgc-front9/
  sdgc-front9.php              Plugin bootstrap, options, asset registration
  inc/
    api.php                    Front9 HTTP client + transient caching
    accent.php                 Reads each league's colour out of its crest
    leagues.php                League view model: stage, labels, spots, dates
    render.php                 Shared markup: heroes, headings, panels, embeds
    register.php               Register button handler (POST → hosted redirect)
    shortcode-leagues.php      [sdgc_leagues]
    shortcode-league.php       [sdgc_league]
    shortcode-event.php        [sdgc_event]
    shortcode-rankings.php     [sdgc_rankings]
  assets/
    sdgc-front9.css            All styling, scoped under .sdgc
    event-tabs.js              Event page tab switching + lazy widget loading
    hero.jpg                   Default hero photo
```

No build step, no dependencies, no database tables.
