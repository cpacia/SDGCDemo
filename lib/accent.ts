/**
 * Picks a league's accent colour out of its crest.
 *
 * The original design gave every league its own colour, keyed to its logo — red
 * for the men's league, green for mixed doubles, gold for skins. Front9 stores
 * no such field, but the crest itself is the source that mattered, so the colour
 * is read back out of the image rather than kept in a table that would go stale
 * the moment an org uploads a new logo.
 *
 * PNG is decoded here with node's own zlib rather than an image library: these
 * crests are one shape (8-bit, non-interlaced) from one pipeline, and anything
 * this can't read falls back to the brand colour instead of failing.
 */

import { inflateSync } from "node:zlib";
import { REVALIDATE_SECONDS } from "./front9";

/** Signature every PNG opens with. */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Ignore near-grey pixels: a crest is mostly black, white and outline. */
const MIN_SATURATION = 0.35;
/** …and ignore the extremes, which carry a hue but read as black or white. */
const MIN_LIGHTNESS = 0.18;
const MAX_LIGHTNESS = 0.9;
/** Below this the crest has no colour worth using. */
const MIN_COLOURED_PIXELS = 40;

/** Hue buckets. 24 keeps red separate from orange without splitting a ring. */
const HUE_BUCKETS = 24;

type RGB = { r: number; g: number; b: number };

/**
 * The accent for one crest, or null when the image can't be read or carries no
 * colour. Memoised per URL: the crest only changes when the org uploads a new
 * one, and that lands on a new versioned path.
 */
const cache = new Map<string, string | null>();

export async function accentFromImage(url: string): Promise<string | null> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  const accent = await extract(url);
  cache.set(url, accent);
  return accent;
}

async function extract(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const pixels = decodePNG(new Uint8Array(await res.arrayBuffer()));
    return pixels ? dominantColour(pixels) : null;
  } catch (err) {
    console.error(`Front9: could not read an accent from "${url}" —`, err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Colour                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The crest's most present colour: hue-bucket every pixel that actually has a
 * hue, weight each by how saturated it is, and average the winning bucket.
 *
 * Weighting matters because a crest's ring is a thin band of vivid colour
 * against a large dark field — counting pixels alone would favour the muddy
 * anti-aliased edge over the ring itself.
 */
function dominantColour(pixels: Uint8Array): string | null {
  const weights = new Float64Array(HUE_BUCKETS);
  const sums = Array.from({ length: HUE_BUCKETS }, () => ({ r: 0, g: 0, b: 0, w: 0 }));
  let coloured = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3];
    if (a < 128) continue; // transparent corners of a round crest

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const { h, s, l } = toHSL(r, g, b);
    if (s < MIN_SATURATION || l < MIN_LIGHTNESS || l > MAX_LIGHTNESS) continue;

    coloured++;
    const bucket = Math.min(HUE_BUCKETS - 1, Math.floor((h / 360) * HUE_BUCKETS));
    const weight = s;
    weights[bucket] += weight;
    sums[bucket].r += r * weight;
    sums[bucket].g += g * weight;
    sums[bucket].b += b * weight;
    sums[bucket].w += weight;
  }

  if (coloured < MIN_COLOURED_PIXELS) return null;

  let best = 0;
  for (let i = 1; i < HUE_BUCKETS; i++) {
    if (weights[i] > weights[best]) best = i;
  }
  const winner = sums[best];
  if (winner.w === 0) return null;

  return toHex(
    vivid({
      r: winner.r / winner.w,
      g: winner.g / winner.w,
      b: winner.b / winner.w,
    }),
  );
}

/**
 * Nudges the averaged colour back to something usable as ink. Averaging pulls a
 * ring's colour toward the dark field behind it, and this accent is also set as
 * text on a black hero, so anything too dark or too washed out is lifted.
 */
function vivid(rgb: RGB): RGB {
  const { h, s, l } = toHSL(rgb.r, rgb.g, rgb.b);
  return fromHSL(h, Math.max(s, 0.55), Math.min(Math.max(l, 0.42), 0.62));
}

function toHSL(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;

  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

function fromHSL(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function toHex({ r, g, b }: RGB): string {
  const channel = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/* -------------------------------------------------------------------------- */
/* PNG                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Decodes a PNG to RGBA bytes, or null for anything outside the shape these
 * crests come in: 8 bits per channel, non-interlaced, truecolour or palette.
 * Deliberately narrow — the caller treats null as "no accent".
 *
 * Greyscale PNGs (colour types 0 and 4) are refused rather than decoded: every
 * pixel in one has zero saturation, so the answer is "no accent" either way.
 */
function decodePNG(bytes: Uint8Array): Uint8Array | null {
  if (bytes.length < 8 || PNG_MAGIC.some((b, i) => bytes[i] !== b)) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colourType = 0;
  let palette: Uint8Array | null = null;
  let paletteAlpha: Uint8Array | null = null;
  const idat: Uint8Array[] = [];

  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );
    const start = offset + 8;
    if (start + length > bytes.length) return null;

    if (type === "IHDR") {
      width = view.getUint32(start);
      height = view.getUint32(start + 4);
      bitDepth = bytes[start + 8];
      colourType = bytes[start + 9];
      const interlaced = bytes[start + 12];
      if (bitDepth !== 8 || interlaced !== 0) return null;
    } else if (type === "PLTE") {
      palette = bytes.subarray(start, start + length);
    } else if (type === "tRNS" && colourType === 3) {
      paletteAlpha = bytes.subarray(start, start + length);
    } else if (type === "IDAT") {
      idat.push(bytes.subarray(start, start + length));
    } else if (type === "IEND") {
      break;
    }

    offset = start + length + 4; // + CRC
  }

  if (!width || !height || idat.length === 0) return null;

  const channels = { 2: 3, 3: 1, 6: 4 }[colourType];
  if (!channels) return null;

  const raw = inflateSync(Buffer.concat(idat.map((c) => Buffer.from(c))));
  const scanlines = unfilter(raw, width, height, channels);
  if (!scanlines) return null;

  return toRGBA(scanlines, width, height, colourType, channels, palette, paletteAlpha);
}

/**
 * Reverses the per-scanline filter each row is encoded with. Every row is a
 * filter byte followed by `width * channels` bytes, and each filter predicts a
 * byte from its left (a), above (b) and above-left (c) neighbours.
 */
function unfilter(
  raw: Uint8Array,
  width: number,
  height: number,
  channels: number,
): Uint8Array | null {
  const stride = width * channels;
  if (raw.length < height * (stride + 1)) return null;

  const out = new Uint8Array(height * stride);
  let pos = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const rowStart = y * stride;
    const prevStart = rowStart - stride;

    for (let x = 0; x < stride; x++) {
      const value = raw[pos + x];
      const a = x >= channels ? out[rowStart + x - channels] : 0;
      const b = y > 0 ? out[prevStart + x] : 0;
      const c = y > 0 && x >= channels ? out[prevStart + x - channels] : 0;

      let recon: number;
      switch (filter) {
        case 0:
          recon = value;
          break;
        case 1:
          recon = value + a;
          break;
        case 2:
          recon = value + b;
          break;
        case 3:
          recon = value + ((a + b) >> 1);
          break;
        case 4:
          recon = value + paeth(a, b, c);
          break;
        default:
          return null;
      }
      out[rowStart + x] = recon & 0xff;
    }
    pos += stride;
  }

  return out;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/** Expands whatever colour type the file uses into flat RGBA. */
function toRGBA(
  scanlines: Uint8Array,
  width: number,
  height: number,
  colourType: number,
  channels: number,
  palette: Uint8Array | null,
  paletteAlpha: Uint8Array | null,
): Uint8Array | null {
  const pixels = new Uint8Array(width * height * 4);

  for (let i = 0, p = 0; i < width * height; i++, p += 4) {
    const s = i * channels;

    switch (colourType) {
      case 2: // truecolour
        pixels[p] = scanlines[s];
        pixels[p + 1] = scanlines[s + 1];
        pixels[p + 2] = scanlines[s + 2];
        pixels[p + 3] = 255;
        break;
      case 3: {
        // palette index
        if (!palette) return null;
        const idx = scanlines[s] * 3;
        pixels[p] = palette[idx];
        pixels[p + 1] = palette[idx + 1];
        pixels[p + 2] = palette[idx + 2];
        pixels[p + 3] = paletteAlpha?.[scanlines[s]] ?? 255;
        break;
      }
      case 6: // truecolour + alpha
        pixels[p] = scanlines[s];
        pixels[p + 1] = scanlines[s + 1];
        pixels[p + 2] = scanlines[s + 2];
        pixels[p + 3] = scanlines[s + 3];
        break;
      default:
        return null;
    }
  }

  return pixels;
}
