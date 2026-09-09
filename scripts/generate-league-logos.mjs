/**
 * Generates the league crest SVGs in public/leagues/.
 *
 * One shared crest template (black roundel, accent ring, arced lockup text,
 * centre motif) so the sixteen league cards read as a single badge family rather
 * than sixteen unrelated logos. Run: node scripts/generate-league-logos.mjs
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
  leaf: `
    <path d="M120 74c-30 18-34 50 0 72z" fill="#ffffff"/>
    <path d="M120 74c30 18 34 50 0 72z" fill="ACCENT"/>
    <path d="M120 74v72" stroke="#0b0b0b" stroke-width="2.5"/>
    <g stroke-linecap="round" stroke-width="2.5" fill="none">
      <path d="M120 100l-17-6M120 122l-16 2" stroke="ACCENT"/>
      <path d="M120 100l17-6M120 122l16 2" stroke="#ffffff"/>
    </g>
    <path d="M120 146v12" stroke="ACCENT" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="120" cy="162" rx="22" ry="4" fill="#ffffff" opacity=".35"/>`,
  twilight: `
    <path d="M90 134a30 30 0 0 1 60 0z" fill="ACCENT"/>
    <path d="M74 134h92" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <path d="M84 148h30M126 148h30" stroke="ACCENT" stroke-width="4" stroke-linecap="round" opacity=".5"/>
    <g fill="#ffffff" opacity=".85">
      <path d="M94 74l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5z"/>
      <path d="M148 90l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>
      <circle cx="122" cy="66" r="3.5"/>
    </g>`,
  moon: `
    <mask id="moonCut">
      <rect width="240" height="240" fill="#ffffff"/>
      <circle cx="140" cy="100" r="34" fill="#000000"/>
    </mask>
    <circle cx="118" cy="112" r="40" fill="ACCENT" mask="url(#moonCut)"/>
    <path d="M152 136l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffffff" opacity=".9"/>
    <circle cx="90" cy="74" r="3.5" fill="#ffffff" opacity=".7"/>
    <path d="M98 156h44" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".4"/>`,
  floodlight: `
    <path d="M102 104L74 154h92l-28-50z" fill="#ffffff" opacity=".12"/>
    <path d="M112 104l-10 50M128 104l10 50" stroke="#ffffff" stroke-width="2" opacity=".22"/>
    <path d="M120 84V62" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    <path d="M94 84h52l-8 20h-36z" fill="ACCENT"/>
    <g fill="#0b0b0b" opacity=".5">
      <circle cx="110" cy="94" r="3.5"/><circle cx="120" cy="94" r="3.5"/><circle cx="130" cy="94" r="3.5"/>
    </g>
    <circle cx="120" cy="142" r="11" fill="#ffffff"/>
    <ellipse cx="120" cy="158" rx="26" ry="5" fill="ACCENT" opacity=".45"/>`,
  bloom: `
    <g fill="ACCENT">
      <circle cx="120" cy="74" r="13"/><circle cx="101" cy="88" r="13"/>
      <circle cx="108" cy="110" r="13"/><circle cx="132" cy="110" r="13"/><circle cx="139" cy="88" r="13"/>
    </g>
    <circle cx="120" cy="94" r="11" fill="#ffffff"/>
    <path d="M120 106v42" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    <path d="M120 130c-15 0-22-8-24-17 13-2 22 5 24 17z" fill="ACCENT" opacity=".75"/>
    <ellipse cx="120" cy="156" rx="24" ry="5" fill="#ffffff" opacity=".35"/>`,
  sunbeam: `
    <circle cx="120" cy="104" r="24" fill="ACCENT"/>
    <g stroke="ACCENT" stroke-width="5" stroke-linecap="round" opacity=".7">
      <path d="M120 62v12M80 104h12M148 104h12M92 76l9 9M148 76l-9 9M92 132l9-9M148 132l-9-9"/>
    </g>
    <path d="M76 152h88" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <path d="M90 163h60" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".4"/>`,
  umbrella: `
    <path d="M120 122L72 122A48 48 0 0 1 86.1 88.1Z" fill="ACCENT"/>
    <path d="M120 122L86.1 88.1A48 48 0 0 1 120 74Z" fill="#ffffff"/>
    <path d="M120 122L120 74A48 48 0 0 1 153.9 88.1Z" fill="ACCENT"/>
    <path d="M120 122L153.9 88.1A48 48 0 0 1 168 122Z" fill="#ffffff"/>
    <path d="M72 122h96" stroke="#0b0b0b" stroke-width="2" opacity=".45"/>
    <path d="M120 122v28a10 10 0 0 0 20 0" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="120" cy="70" r="4.5" fill="#ffffff"/>`,
  wedge: `
    <path d="M154 60l-16 56" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <path d="M154 62l-5 16" stroke="ACCENT" stroke-width="11" stroke-linecap="round"/>
    <g transform="rotate(-10 122 132)">
      <path d="M100 150a7 7 0 0 1-7-8l3-14c2-9 9-15 18-15h24a7 7 0 0 1 7 7v23a7 7 0 0 1-7 7z" fill="ACCENT"/>
      <g stroke="#0b0b0b" stroke-width="2.5" opacity=".35" stroke-linecap="round">
        <path d="M108 126h30M104 134h34M102 142h36"/>
      </g>
    </g>
    <circle cx="74" cy="142" r="10" fill="#ffffff"/>
    <path d="M62 160h100" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".3"/>`,
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
  { file: "thursday-fall-mixed", top: "FALL MIXED", bottom: "THURSDAY NIGHT", motif: "leaf", accent: "#e2622a" },
  { file: "ladies-league", top: "LADIES LEAGUE", bottom: "TUESDAY NIGHT", motif: "tee", accent: "#d84f9c" },
  { file: "junior-development", top: "JUNIOR TOUR", bottom: "SATURDAY AM", motif: "star", accent: "#3aa0e0" },
  { file: "friday-skins", top: "SKINS GAME", bottom: "FRIDAY NIGHT", motif: "ball", accent: "#c9a227" },
  { file: "corporate-league", top: "CORPORATE CUP", bottom: "SDGC HUDSON NH", motif: "trophy", accent: "#8e6bd6" },
  { file: "monday-twilight", top: "TWILIGHT LEAGUE", bottom: "MONDAY PM", motif: "twilight", accent: "#b45cf0" },
  { file: "monday-night", top: "NIGHT LEAGUE", bottom: "MONDAY NIGHT", motif: "moon", accent: "#4f6bf0" },
  { file: "tuesday-night", top: "NIGHT LEAGUE", bottom: "TUESDAY NIGHT", motif: "floodlight", accent: "#24c1b5" },
  { file: "tuesday-morning-ladies", top: "LADIES LEAGUE", bottom: "TUESDAY AM", motif: "bloom", accent: "#ef5a8c" },
  { file: "wednesday-morning", top: "MORNING LEAGUE", bottom: "WEDNESDAY AM", motif: "sunbeam", accent: "#3fbf7f" },
  { file: "wednesday-afternoon", top: "AFTERNOON LEAGUE", bottom: "WEDNESDAY PM", motif: "umbrella", accent: "#ff6f4a" },
  { file: "wednesday-night", top: "NIGHT LEAGUE", bottom: "WEDNESDAY NIGHT", motif: "wedge", accent: "#5ad1f0" },
];

mkdirSync(OUT, { recursive: true });
for (const league of LEAGUES) {
  writeFileSync(`${OUT}/${league.file}.svg`, crest(league));
}
console.log(`Wrote ${LEAGUES.length} crests to ${OUT}`);
