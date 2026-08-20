/**
 * Where this site's Front9 data comes from. Shared by every module that reads
 * the public API, so the org and the origin are stated once.
 */

export const FRONT9_ORG = "seth-dichard-golf-centers";

/** Serves both the public API and the /media/... images it points at. */
export const FRONT9_API = "https://api.front9.com";

/** Content changes rarely; a five-minute window keeps the pages cheap. */
export const REVALIDATE_SECONDS = 300;

/** Base for every public read, e.g. `${publicURL}/events/{slug}`. */
export const publicURL = `${FRONT9_API}/api/public/v1/orgs/${FRONT9_ORG}`;
