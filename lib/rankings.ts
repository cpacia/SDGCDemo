/**
 * Facility-wide player ranking — an in-house take on the world ranking, run
 * across every league and open tournament we score.
 *
 * It renders with the same Front9 `standings` widget the league pages use; the
 * only difference is which series it points at.
 */
export const RANKINGS = {
  org: "seth-dichard-golf-centers",
  /** data-series for the standings widget — the "Indoor Golf Rankings" series. */
  series: "14",
} as const;

/** Headline facts for the strip under the page header. Demo values. */
export const RANKING_FACTS = [
  { label: "Ranked Players", value: "140+" },
  { label: "Ranking Period", value: "Rolling 104 Weeks" },
  { label: "Counting Events", value: "Leagues + Opens" },
  { label: "Updated", value: "Every Monday" },
];

/** The "how it works" rules, shown beside the table. */
export const RANKING_RULES = [
  {
    title: "Every Round Counts",
    body: "League nights, open tournaments, and skins games all award ranking points. If we scored it on our simulators, it is in the ranking.",
  },
  {
    title: "Points by Strength of Field",
    body: "Events are weighted by the size and average handicap of the field, so beating a stacked Friday night field is worth more than a quiet one.",
  },
  {
    title: "A Rolling 104 Weeks",
    body: "Points age out one year to the week. Stay sharp through the season and your position holds; sit out and it drifts.",
  },
  {
    title: "Six-Event Minimum",
    body: "Players need six counting events before they appear. New players show as unranked until they get there.",
  },
];
