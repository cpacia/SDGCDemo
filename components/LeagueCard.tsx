import Image from "next/image";
import Link from "next/link";
import type { League } from "@/lib/leagues";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LeagueCard({ league }: { league: League }) {
  const full = league.spotsOpen === 0;

  return (
    <Link
      href={`/league/${league.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)]"
    >
      {/* Accent rule keyed to the crest colour */}
      <span
        aria-hidden
        className="h-[4px] w-full shrink-0"
        style={{ backgroundColor: league.accent }}
      />

      <div className="flex items-start gap-4 px-6 pt-6">
        <Image
          src={league.logo}
          alt=""
          width={240}
          height={240}
          className="h-[72px] w-[72px] shrink-0 transition-transform duration-300 group-hover:scale-105"
        />
        <div className="min-w-0">
          {/* Fixed two-line boxes keep the header block level across a row */}
          <h3 className="flex min-h-[2.4em] items-start font-display text-[18px] leading-[1.2] font-semibold tracking-[0.03em] text-sdgc-ink uppercase">
            {league.name}
          </h3>
          <p className="mt-1.5 flex min-h-[2.8em] items-start font-sans text-[12px] leading-[1.4] font-semibold tracking-wide text-sdgc-red uppercase">
            {league.day} &middot; {league.time}
          </p>
        </div>
      </div>

      <p className="mt-4 flex-1 px-6 text-[13.5px] leading-[1.75] text-sdgc-body">{league.blurb}</p>

      {/* Two fixed rows so the meta block lines up across every card in a row */}
      <dl className="mt-5 divide-y divide-black/5 border-t border-black/10 px-6 font-sans">
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-[10px] font-semibold tracking-[0.18em] text-black/40 uppercase">
            Format
          </dt>
          <dd className="text-right text-[12.5px] font-semibold text-sdgc-ink">{league.format}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-[10px] font-semibold tracking-[0.18em] text-black/40 uppercase">
            Season
          </dt>
          <dd className="text-right text-[12.5px] font-semibold text-sdgc-ink">{league.season}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between border-t border-black/10 bg-[#fafafa] px-6 py-3.5">
        <span
          className={`font-sans text-[11px] font-bold tracking-[0.12em] uppercase ${
            full ? "text-black/40" : "text-sdgc-red"
          }`}
        >
          {full ? `Full · ${league.teams} teams` : `${league.spotsOpen} spots open`}
        </span>
        <span className="flex items-center gap-1.5 font-sans text-[12px] font-bold tracking-wide text-sdgc-ink uppercase transition-colors duration-300 group-hover:text-sdgc-red">
          View
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ArrowIcon />
          </span>
        </span>
      </div>
    </Link>
  );
}
