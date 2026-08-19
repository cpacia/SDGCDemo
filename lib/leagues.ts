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

export const FRONT9_ORG = "seth-dichard-golf-centers";

/** Serves both the public API and the /media/... images it points at. */
const FRONT9_API = "https://api.front9.com";

/** Leagues change rarely; a five-minute window keeps the page cheap. */
const REVALIDATE_SECONDS = 300;

/** A finished league stays on the site for one month past its end date. */
const GRACE_MONTHS = 1;

/** Fallback crest colour — the API carries no per-league accent. */
const DEFAULT_ACCENT = "#e02b2b";

export type EventSeriesStatus = "draft" | "open" | "active" | "completed" | "canceled";

/** The subset of EventSeriesResponseDTO this site reads. */
type EventSeriesDTO = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  seasonLabel?: string;
  status: EventSeriesStatus;
  /** Date-only, "YYYY-MM-DD". */
  startDate?: string;
  endDate?: string;
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
  /** Weekly play night, inferred from the start date. */
  day: string;
  format: string;
  season: string;
  entryLabel: string;
  blurb: string;
  accent: string;
  status: EventSeriesStatus;
  /** null when the league publishes no entry cap. */
  spotsOpen: number | null;
  full: boolean;
  /** Registration state for the card footer, e.g. "4 spots open". */
  statusLabel: string;
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

const listURL = `${FRONT9_API}/api/public/v1/orgs/${FRONT9_ORG}/event-series`;

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

  return {
    id: series.id,
    slug: series.slug,
    name: series.name,
    logo: `${FRONT9_API}${series.seriesImageUrl}`,
    day: describeDay(series.startDate),
    format: series.seasonLabel?.trim() || entryLabel,
    season: describeSeason(series),
    entryLabel,
    blurb: series.description?.trim() || "",
    accent: DEFAULT_ACCENT,
    status: series.status,
    spotsOpen,
    full,
    statusLabel: describeStatus(series, spotsOpen),
    front9: {
      org: FRONT9_ORG,
      hasSchedule: series.linkedEventCount > 0,
      hasStandings: series.standingSeriesId != null,
    },
  };
}

/**
 * Seats left, in entries. A team league sells one entry per pair/foursome, so
 * the roster count has to be divided down before it can be compared to the cap.
 * null when the league publishes no cap.
 */
function countSpotsOpen(series: EventSeriesDTO): number | null {
  if (series.maxEntries == null) return null;
  const size = Math.max(1, series.entrySize);
  const taken = Math.ceil(series.memberCount / size);
  return Math.max(0, series.maxEntries - taken);
}

function describeEntry(entrySize: number): string {
  if (entrySize <= 1) return "Individual";
  const words = ["", "", "Two", "Three", "Four", "Five", "Six"];
  return `${words[entrySize] ?? entrySize}-Person Teams`;
}

/**
 * A league plays the same night every week, so the start date names the night.
 * The public API carries no tee time, so the card shows the day alone.
 */
function describeDay(startDate?: string): string {
  const start = parseAPIDate(startDate);
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

function describeStatus(series: EventSeriesDTO, spotsOpen: number | null): string {
  if (series.status === "completed") return "Season Complete";
  if (series.status === "active") return "Season Underway";
  if (series.status === "open") {
    if (spotsOpen === null) return "Registration Open";
    return spotsOpen === 0 ? "Registration Full" : `${spotsOpen} spots open`;
  }
  return "Season Underway";
}

/* -------------------------------------------------------------------------- */
/* Dates — the API sends date-only strings, so everything stays in UTC to keep */
/* "Jul 16" from sliding to "Jul 15" west of Greenwich.                       */
/* -------------------------------------------------------------------------- */

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
