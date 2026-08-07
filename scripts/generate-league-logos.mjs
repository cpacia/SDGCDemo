/**
 * Generates the league crest SVGs in public/leagues/.
 *
 * One shared crest template (black roundel, accent ring, arced lockup text,
 * centre motif) so the eight league cards read as a single badge family rather
 * than eight unrelated logos. Run: node scripts/generate-league-logos.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/leagues");

const MOTIFS = {
  flag: `
    <path d="M104 152V88" stroke="ACCENT" stroke-width="6" stroke-linecap="round"/>
    <path d="M104 90h44l-12 14 12 14h-44z" fill="ACCENT"/>
    <ellipse cx="120" cy="154" rx="26" ry="5" fill="#ffffff" opacity=".35"/>`,
  clubs: `
    <path d="M92 84l26 56" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
    <path d="M148 84l-26 56" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
    <path d="M114 140h14l6 14h-26z" fill="ACCENT"/>
    <circle cx="120" cy="76" r="9" fill="ACCENT"/>`,
  ball: `
    <circle cx="120" cy="114" r="32" fill="#ffffff"/>
    <g fill="#0d0d0d" opacity=".28">
      <circle cx="108" cy="102" r="3.2"/><circle cx="120" cy="98" r="3.2"/><circle cx="132" cy="102" r="3.2"/>
      <circle cx="104" cy="114" r="3.2"/><circle cx="120" cy="112" r="3.2"/><circle cx="136" cy="114" r="3.2"/>
      <circle cx="108" cy="126" r="3.2"/><circle cx="120" cy="126" r="3.2"/><circle cx="132" cy="126" r="3.2"/>
    </g>
    <path d="M96 152h48" stroke="ACCENT" stroke-width="6" stroke-linecap="round"/>`,
  trophy: `
    <path d="M100 78h40v22a20 20 0 0 1-40 0z" fill="ACCENT"/>
    <path d="M100 82H90a12 12 0 0 0 12 12M140 82h10a12 12 0 0 1-12 12" stroke="ACCENT" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M116 120h8v18h-8z" fill="#ffffff"/>
    <path d="M102 138h36v9h-36z" fill="#ffffff"/>
    <path d="M96 152h48" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".45"/>`,
  tee: `
    <path d="M98 88h44l-14 16v40a8 8 0 0 1-16 0v-40z" fill="ACCENT"/>
    <circle cx="120" cy="72" r="13" fill="#ffffff"/>
    <path d="M92 88h56" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".5"/>`,
  sunrise: `
    <path d="M88 138a32 32 0 0 1 64 0z" fill="ACCENT"/>
    <path d="M80 148h80" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".6">
      <path d="M120 78v12M88 92l8 9M152 92l-8 9M74 122h12M154 122h12"/>
    </g>`,
  target: `
    <circle cx="120" cy="114" r="34" fill="none" stroke="#ffffff" stroke-width="6"/>
    <circle cx="120" cy="114" r="20" fill="none" stroke="ACCENT" stroke-width="6"/>
    <circle cx="120" cy="114" r="7" fill="ACCENT"/>
    <path d="M120 62v14M120 152v14M68 114h14M158 114h14" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".55"/>`,
  pair: `
    <circle cx="106" cy="114" r="24" fill="none" stroke="#ffffff" stroke-width="7"/>
    <circle cx="136" cy="114" r="24" fill="none" stroke="ACCENT" stroke-width="7"/>
    <path d="M96 154h48" stroke="ACCENT" stroke-width="6" stroke-linecap="round"/>
    <circle cx="121" cy="76" r="8" fill="#ffffff"/>`,
  star: `
    <path d="M120 74l12 26 28 4-20 20 5 28-25-14-25 14 5-28-20-20 28-4z" fill="ACCENT"/>
    <path d="M96 156h48" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".5"/>`,
};

const crest = ({ top, bottom, motif, accent }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="${top} ${bottom}">
  <defs>
    <!-- Left-to-right over the top (sweep 1) and under the bottom (sweep 0),
         so both bands of lockup text sit upright. -->
    <path id="arcTop" d="M28,120 A92,92 0 0 1 212,120" fill="none"/>
    <path id="arcBottom" d="M34,120 A86,86 0 0 0 206,120" fill="none"/>
    <radialGradient id="glow" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#0b0b0b"/>
    </radialGradient>
  </defs>

  <circle cx="120" cy="120" r="118" fill="url(#glow)"/>
  <circle cx="120" cy="120" r="115" fill="none" stroke="${accent}" stroke-width="5"/>
  <circle cx="120" cy="120" r="76" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".22"/>

  ${MOTIFS[motif].replaceAll("ACCENT", accent)}

  <g font-family="'Oswald','Arial Narrow',Arial,sans-serif" font-weight="600" fill="#ffffff">
    <text font-size="19" letter-spacing="4" text-anchor="middle">
      <textPath href="#arcTop" startOffset="50%">${top}</textPath>
    </text>
    <text font-size="13" letter-spacing="3" text-anchor="middle" opacity=".7">
      <textPath href="#arcBottom" startOffset="50%">${bottom}</textPath>
    </text>
  </g>

  <g fill="${accent}">
    <path d="M22 120l7-7 7 7-7 7z"/>
    <path d="M204 120l7-7 7 7-7 7z"/>
  </g>
</svg>
`;

const LEAGUES = [
  { file: "monday-night-mens", top: "MONDAY NIGHT", bottom: "MEN'S LEAGUE", motif: "flag", accent: "#e02b2b" },
  { file: "tuesday-mixed-doubles", top: "MIXED DOUBLES", bottom: "TUESDAY LEAGUE", motif: "clubs", accent: "#7cda24" },
  { file: "wednesday-senior", top: "SENIOR CIRCUIT", bottom: "WEDNESDAY AM", motif: "sunrise", accent: "#f0a726" },
  { file: "thursday-couples", top: "COUPLES LEAGUE", bottom: "THURSDAY NIGHT", motif: "pair", accent: "#e02b2b" },
  { file: "ladies-league", top: "LADIES LEAGUE", bottom: "TUESDAY NIGHT", motif: "tee", accent: "#d84f9c" },
  { file: "junior-development", top: "JUNIOR TOUR", bottom: "SATURDAY AM", motif: "star", accent: "#3aa0e0" },
  { file: "friday-skins", top: "SKINS GAME", bottom: "FRIDAY NIGHT", motif: "ball", accent: "#c9a227" },
  { file: "corporate-league", top: "CORPORATE CUP", bottom: "SDGC HUDSON NH", motif: "trophy", accent: "#8e6bd6" },
];

mkdirSync(OUT, { recursive: true });
for (const league of LEAGUES) {
  writeFileSync(`${OUT}/${league.file}.svg`, crest(league));
}
console.log(`Wrote ${LEAGUES.length} crests to ${OUT}`);
