"use server";

import { redirect } from "next/navigation";
import { fetchLeague, startRegistration } from "@/lib/leagues";
import { CONTACT } from "@/lib/nav";

/**
 * Sends a golfer into Front9's hosted registration for a league.
 *
 * The hosted URL has to be minted per registration (it carries the org and the
 * league), so the button is a form posting here rather than a plain link.
 *
 * Takes the league SLUG, not its id: the slug is the identifier the page is
 * already built around, and a server function is reachable by direct POST, so
 * the id it acts on is better resolved here than accepted from the caller. The
 * same lookup re-checks that the league is genuinely taking sign-ups.
 */
export async function startLeagueRegistration(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");

  // Anything unexpected falls back to the booking page — the golfer still lands
  // somewhere they can act, which beats an error page over a sign-up click.
  let target = CONTACT.bookNow;

  const league = slug ? await fetchLeague(slug) : null;
  if (league && league.stage === "registering") {
    target = (await startRegistration(league.id)) ?? CONTACT.bookNow;
  }

  // Outside any try/catch: redirect() works by throwing.
  redirect(target);
}
