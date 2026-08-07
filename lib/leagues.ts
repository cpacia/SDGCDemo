/**
 * Demo league roster. Hard-coded for the prototype — in production these come
 * from the Front9 org's league list.
 */
export type League = {
  slug: string;
  name: string;
  logo: string;
  day: string;
  time: string;
  format: string;
  season: string;
  teams: number;
  spotsOpen: number;
  blurb: string;
  accent: string;
  /** Front9 embed config. Absent until the league is set up in Front9. */
  front9?: {
    org: string;
    /** data-tags for the schedule widget. */
    scheduleTags: string;
    /** data-series for the standings widget. */
    standingsSeries: string;
  };
};

export const LEAGUES: League[] = [
  {
    slug: "monday-night-mens",
    name: "Monday Night Men's League",
    logo: "/leagues/monday-night-mens.svg",
    day: "Mondays",
    time: "6:00 – 9:30 PM",
    format: "Net Stroke Play",
    season: "Jan 5 – Mar 30, 2026",
    teams: 24,
    spotsOpen: 0,
    blurb:
      "The flagship indoor league. Two-man teams, nine holes a week on a rotating course list, handicapped so every flight stays in the hunt.",
    accent: "#e02b2b",
  },
  {
    slug: "tuesday-mixed-doubles",
    name: "Mixed Doubles League",
    logo: "/leagues/tuesday-mixed-doubles.svg",
    day: "Tuesdays",
    time: "6:30 – 9:00 PM",
    format: "Scramble",
    season: "Jan 6 – Mar 24, 2026",
    teams: 16,
    spotsOpen: 4,
    blurb:
      "Partner up. Relaxed scramble format built for couples and friends who want the competition without the four-hour round.",
    accent: "#7cda24",
  },
  {
    slug: "wednesday-senior",
    name: "Senior Circuit",
    logo: "/leagues/wednesday-senior.svg",
    day: "Wednesdays",
    time: "9:00 AM – 12:00 PM",
    format: "Stableford",
    season: "Jan 7 – Apr 1, 2026",
    teams: 20,
    spotsOpen: 6,
    blurb:
      "Daytime golf for the 55-and-over crowd. Stableford scoring keeps the pace moving and the coffee pot stays on all morning.",
    accent: "#f0a726",
  },
  {
    slug: "thursday-couples",
    name: "Thursday Night Couples League",
    logo: "/leagues/thursday-couples.svg",
    day: "Thursdays",
    time: "6:00 – 10:00 PM",
    format: "Two-Person Scramble",
    season: "Jul 16 – Aug 27, 2026",
    teams: 9,
    spotsOpen: 2,
    blurb:
      "Play as a pair. Two-person scramble on a rotating list of New Hampshire courses, handicapped so every couple has a shot at the season title.",
    accent: "#e02b2b",
    front9: {
      org: "seth-dichard-golf-centers",
      scheduleTags: "Couples",
      standingsSeries: "5",
    },
  },
  {
    slug: "ladies-league",
    name: "Ladies League",
    logo: "/leagues/ladies-league.svg",
    day: "Tuesdays",
    time: "10:00 AM – 1:00 PM",
    format: "Best Ball",
    season: "Jan 6 – Mar 24, 2026",
    teams: 14,
    spotsOpen: 5,
    blurb:
      "All abilities welcome. Best-ball pairings, a rotating weekly game, and a clinic with our staff before the first tee time each month.",
    accent: "#d84f9c",
  },
  {
    slug: "junior-development",
    name: "Junior Tour",
    logo: "/leagues/junior-development.svg",
    day: "Saturdays",
    time: "8:00 – 11:00 AM",
    format: "Age Flights",
    season: "Jan 10 – Apr 4, 2026",
    teams: 28,
    spotsOpen: 8,
    blurb:
      "Ages 8–17 across three flights. Every week pairs 45 minutes of instruction with nine holes of real, scored competition.",
    accent: "#3aa0e0",
  },
  {
    slug: "friday-skins",
    name: "Friday Night Skins",
    logo: "/leagues/friday-skins.svg",
    day: "Fridays",
    time: "7:00 – 11:00 PM",
    format: "Skins",
    season: "Year Round",
    teams: 18,
    spotsOpen: 10,
    blurb:
      "Drop-in skins game with a carryover pot. Show up, get flighted, play nine. No season commitment and the bar stays open late.",
    accent: "#c9a227",
  },
  {
    slug: "corporate-league",
    name: "Corporate Cup",
    logo: "/leagues/corporate-league.svg",
    day: "Wednesdays",
    time: "5:30 – 8:30 PM",
    format: "Four-Person Team",
    season: "Feb 4 – Apr 15, 2026",
    teams: 10,
    spotsOpen: 3,
    blurb:
      "Company teams of four battling for the Cup. Bay rental, scoring, and a catered final night are all rolled into the team entry.",
    accent: "#8e6bd6",
  },
];
