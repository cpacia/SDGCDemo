/**
 * Event data from the Front9 public API:
 *
 *   GET {FRONT9_API}/api/public/v1/orgs/{orgSlug}/events/{slug}
 *
 * The widgets link here with the event's slug, which is all this site ever
 * holds — everything shown on the page is read back from that.
 */

import { publicURL, REVALIDATE_SECONDS } from "./front9";

/** The subset of the public event payload this site reads. */
export type Front9Event = {
  id: number;
  slug: string;
  title: string;
  status: string;
  /** Date-only, "YYYY-MM-DD". */
  startDate?: string;
  endDate?: string;
  /** Pre-joined for display, e.g. "Owl's Nest Golf Club — Campton, NH". */
  courseListSummary?: string;
  locationListSummary?: string;
};

/**
 * One event by slug, or null when Front9 doesn't have it — an event that was
 * unpublished, made private, or a slug someone typed by hand. Callers fall back
 * to what they can derive from the slug itself rather than erroring.
 */
export async function fetchEvent(slug: string): Promise<Front9Event | null> {
  if (!slug) return null;

  const url = `${publicURL}/events/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as Front9Event;
  } catch (err) {
    console.error(`Front9: could not load event "${slug}" —`, err);
    return null;
  }
}
