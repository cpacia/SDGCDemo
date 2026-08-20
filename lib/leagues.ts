/**
 * League data comes from the Front9 public API — a league is an "event series"
 * there:
 *
 *   GET {FRONT9_API}/api/public/v1/orgs/{orgSlug}/event-series
 *   GET {FRONT9_API}/api/public/v1/orgs/{orgSlug}/event-series/{slug}
 *
 * Both are public and unauthenticated, and only return leagues that are open,
 * active or completed — drafts and private leagues never reach us.
 */

import { FRONT9_API, FRONT9_ORG, publicURL, REVALIDATE_SECONDS } from "./front9";

export { FRONT9_ORG };

/** A finished league stays on the site for one month past its end date. */
const GRACE_MONTHS = 1;

/** Fallback crest colour — the API carries no per-league accent. */
const DEFAULT_ACCENT = "#e02b2b";

export type EventSeriesStatus = "draft" | "open" | "active" | "completed" | "canceled";

/**
 * A league's position in its own calendar. Derived from the dates rather than
 * read off `status` alone: an org sets the status by hand and routinely leaves a
 * league "open" after its first night, so the dates are what actually say
 * whether someone can still join.
 */
export type LeagueStage =
  | "upcoming" // registration hasn't opened yet
  | "registering" // taking sign-ups now
  | "closed" // sign-ups over, first night still to come
  | "playing" // season underway
  | "finished";

/** The subset of EventSeriesResponseDTO this site reads. */
type EventSeriesDTO = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  seasonLabel?: string;
  scheduleLabel?: string;
  status: EventSeriesStatus;
  /** Date-only, "YYYY-MM-DD" — every date on this DTO, registration included. */
  startDate?: string;
  endDate?: string;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  maxEntries?: number;
  entrySize: number;
  standingSeriesId?: number;
  /** Server-relative, always populated — falls back to a stock crest. */
  seriesImageUrl: string;
  memberCount: number;
  linkedEventCount: number;
};

/** A league shaped for the card + league page. */
export type League = {
  id: number;
  slug: string;
  name: string;
  logo: string;
  /** When the league plays, e.g. "Thursdays: 6:00-10:00 PM". */
  schedule: string;
  format: string;
  season: string;
  entryLabel: string;
  blurb: string;
  accent: string;
  status: EventSeriesStatus;
  /** Where the league is in its own calendar — see stageOf. */
  stage: LeagueStage;
  /** Golfers on the roster. */
  members: number;
  /** Seats left, in golfers. null when the league publishes no cap. */
  spotsOpen: number | null;
  full: boolean;
  /** Card footer line, e.g. "4 spots open" or "Full · 24 teams". */
  statusLabel: string;
  /** Whether that line is an invitation (accent) or just a state (muted). */
  statusTone: "open" | "closed";
  /**
   * Front9 embed config. Both widgets take the league's own slug, so the only
   * thing left to decide is whether there's anything behind them yet.
   */
  front9: {
    org: string;
    /** The league has nights linked to it. */
    hasSchedule: boolean;
    /** The league is linked to a standings table. */
    hasStandings: boolean;
  };
};

/* -------------------------------------------------------------------------- */
/* Fetching                                                                   */
/* -------------------------------------------------------------------------- */

const listURL = `${publicURL}/event-series`;

/**
 * Every league the org is showing right now: still to come, running, or
 * finished within the past month. Returns [] if Front9 is unreachable — a
 * league outage shouldn't take the whole home page down with it.
 */
export async function fetchLeagues(): Promise<League[]> {
  let list: EventSeriesDTO[];
  try {
    const res = await fetch(listURL, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    list = (await res.json()) as EventSeriesDTO[];
  } catch (err) {
    console.error("Front9: could not load leagues —", err);
    return [];
  }

  const now = new Date();
  return list
    .filter((series) => isStillShowing(series, now))
    .sort(byRunningFirst)
    .map(toLeague);
}

/** One league by slug, or null if Front9 doesn't have it (or is private). */
export async function fetchLeague(slug: string): Promise<League | null> {
  const url = `${listURL}/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return toLeague((await res.json()) as EventSeriesDTO);
  } catch (err) {
    console.error(`Front9: could not load league "${slug}" —`, err);
    return null;
  }
}

/**
 * Kicks off a league registration and returns the hosted page to send the
 * golfer to, or null if Front9 can't start one.
 *
 * Payment never flows through this API: the POST mints a URL on Front9's own
 * registration host, which is where the golfer picks a partner and pays. The
 * response is per-golfer and single-use in spirit, so it is never cached.
 */
export async function startRegistration(seriesID: number): Promise<string | null> {
  const url = `${listURL}/${seriesID}/register/start`;
  try {
    const res = await fetch(url, { method: "POST", cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const body = (await res.json()) as { url?: string };
    return body.url?.trim() || null;
  } catch (err) {
    console.error(`Front9: could not start registration for league ${seriesID} —`, err);
    return null;
  }
}

/**
 * A league drops off the site one month after it ends. Anything without an end
 * date (a year-round league) stays up.
 */
function isStillShowing(series: EventSeriesDTO, now: Date): boolean {
  const end = parseAPIDate(series.endDate);
  if (!end) return true;
  // Through the end of the last day, not its midnight.
  return now < addDaysUTC(addMonthsUTC(end, GRACE_MONTHS), 1);
}

/**
 * Running and upcoming leagues first, in the order they start; then the ones
 * playing out their grace month, most recently finished first.
 */
function byRunningFirst(a: EventSeriesDTO, b: EventSeriesDTO): number {
  const done = (s: EventSeriesDTO) => (s.status === "completed" ? 1 : 0);
  if (done(a) !== done(b)) return done(a) - done(b);
  if (done(a)) return (b.endDate ?? "").localeCompare(a.endDate ?? "");
  return (a.startDate ?? "").localeCompare(b.startDate ?? "");
}

/* -------------------------------------------------------------------------- */
/* Mapping                                                                    */
/* -------------------------------------------------------------------------- */

function toLeague(series: EventSeriesDTO): League {
  const entryLabel = describeEntry(series.entrySize);
  const spotsOpen = countSpotsOpen(series);
  const full = spotsOpen === 0;
  const stage = stageOf(series, new Date());

  return {
    id: series.id,
    slug: series.slug,
    name: series.name,
    logo: `${FRONT9_API}${series.seriesImageUrl}`,
    schedule: describeSchedule(series),
    format: series.seasonLabel?.trim() || entryLabel,
    season: describeSeason(series),
    entryLabel,
    blurb: series.description?.trim() || "",
    accent: DEFAULT_ACCENT,
    status: series.status,
    stage,
    members: series.memberCount,
    spotsOpen,
    full,
    statusLabel: describeStatus(series, stage, spotsOpen),
    // Only an actual invitation gets the accent: a season already underway or a
    // full roster is a state, not a call to action.
    statusTone: stage === "registering" && !full ? "open" : "closed",
    front9: {
      org: FRONT9_ORG,
      hasSchedule: series.linkedEventCount > 0,
      hasStandings: series.standingSeriesId != null,
    },
  };
}

/**
 * Seats left, in GOLFERS. `maxEntries` is named for entries but the API enforces
 * it against the roster count — a pairs league capped at 18 holds 18 golfers,
 * not 18 pairs — so the two compare directly. null when there's no cap.
 */
function countSpotsOpen(series: EventSeriesDTO): number | null {
  if (series.maxEntries == null) return null;
  return Math.max(0, series.maxEntries - series.memberCount);
}

function describeEntry(entrySize: number): string {
  if (entrySize <= 1) return "Individual";
  const words = ["", "", "Two", "Three", "Four", "Five", "Six"];
  return `${words[entrySize] ?? entrySize}-Person Teams`;
}

/**
 * When the league plays. `scheduleLabel` is the org's own wording and carries
 * the tee times ("Thursdays: 6:00-10:00 PM"), so it's used verbatim wherever
 * it's set.
 *
 * Without one there's only the start date to go on: a league plays the same
 * night every week, so its first night names the night — but nothing in the API
 * carries a time, which is the whole reason scheduleLabel exists.
 */
function describeSchedule(series: EventSeriesDTO): string {
  const label = series.scheduleLabel?.trim();
  if (label) return label;

  const start = parseAPIDate(series.startDate);
  if (!start) return "Schedule TBA";
  return `${new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(start)}s`;
}

function describeSeason(series: EventSeriesDTO): string {
  const start = parseAPIDate(series.startDate);
  const end = parseAPIDate(series.endDate);

  if (start && end) {
    const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
    return `${formatDate(start, !sameYear)} – ${formatDate(end, true)}`;
  }
  if (start) return `Starts ${formatDate(start, true)}`;
  if (end) return `Through ${formatDate(end, true)}`;
  return series.seasonLabel?.trim() || "Year Round";
}

/**
 * Which stage a league is in, most-final first: a finished season is finished
 * whatever its registration window says, and a season that has started is
 * underway even if the org never flipped the status off "open".
 */
function stageOf(series: EventSeriesDTO, now: Date): LeagueStage {
  const today = startOfUTCDay(now);

  if (series.status === "completed" || series.status === "canceled") return "finished";
  const end = parseAPIDate(series.endDate);
  if (end && today > end) return "finished";

  const start = parseAPIDate(series.startDate);
  if (series.status === "active" || (start && today >= start)) return "playing";

  const opens = parseAPIDate(series.registrationOpensAt);
  if (opens && today < opens) return "upcoming";

  // Inclusive: a league closing "Mar 4" takes sign-ups all of Mar 4, matching
  // how the API treats the same date.
  const closes = parseAPIDate(series.registrationClosesAt);
  if (closes && today > closes) return "closed";

  return "registering";
}

/**
 * The card's bottom line. While a league is taking sign-ups this is the number
 * that matters ("6 spots open"); once it isn't, it's the field it ended up with
 * ("Full · 24 teams").
 */
function describeStatus(
  series: EventSeriesDTO,
  stage: LeagueStage,
  spotsOpen: number | null,
): string {
  const field = describeField(series);

  switch (stage) {
    case "finished":
      return "Season Complete";
    case "playing":
      return field ? `Season Underway · ${field}` : "Season Underway";
    case "upcoming": {
      const opens = parseAPIDate(series.registrationOpensAt);
      return opens ? `Opens ${formatDate(opens, false)}` : "Registration Opens Soon";
    }
    case "closed":
      return field ? `Registration Closed · ${field}` : "Registration Closed";
    case "registering":
      if (spotsOpen === null) return "Registration Open";
      if (spotsOpen === 0) return field ? `Full · ${field}` : "Registration Full";
      return `${spotsOpen} spots open`;
  }
}

/**
 * The size of the full field, in the unit the league is played in. The cap is a
 * golfer count, so a team league divides it down — and only when it divides
 * evenly, since an odd cap doesn't describe a whole number of teams.
 */
function describeField(series: EventSeriesDTO): string {
  const cap = series.maxEntries;
  if (cap == null) return "";
  const size = series.entrySize;
  if (size > 1 && cap % size === 0) return `${cap / size} teams`;
  return `${cap} players`;
}

/* -------------------------------------------------------------------------- */
/* Dates — the API sends date-only strings, so everything stays in UTC to keep */
/* "Jul 16" from sliding to "Jul 15" west of Greenwich.                       */
/* -------------------------------------------------------------------------- */

/**
 * Today at UTC midnight, so it compares like-for-like against the date-only
 * values the API sends — otherwise "closes today" reads as closed all morning
 * west of Greenwich.
 */
function startOfUTCDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function parseAPIDate(value?: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function formatDate(date: Date, withYear: boolean): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(date);
}

function addDaysUTC(date: Date, days: number): Date {
  const out = new Date(date);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

/** Clamps to the last day of the target month, so Jan 31 + 1 lands on Feb 28. */
function addMonthsUTC(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}
