import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Front9Embed from "@/components/Front9Embed";
import { RANKING_FACTS, RANKING_RULES, RANKINGS } from "@/lib/rankings";

export const metadata: Metadata = {
  title: "Indoor Golf Rankings | Seth Dichard Golf Centers",
  description:
    "The facility-wide player ranking for Seth Dichard Golf Centers — every league night and open tournament, scored and ranked over a rolling 2 years.",
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RankingsPage() {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          src="/brand/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.78)_50%,rgba(0,0,0,0.45)_100%)]"
        />

        <div className="relative mx-auto w-[85%] max-w-[1180px] py-14 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold tracking-[0.16em] text-white/60 uppercase transition-colors duration-300 hover:text-white"
          >
            <ArrowLeftIcon />
            Leagues &amp; Tournaments
          </Link>

          <p className="mt-8 font-sans text-[12px] font-semibold tracking-[0.3em] text-sdgc-red uppercase">
            Every League &middot; Every Tournament
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[34px] leading-[1.08] font-bold tracking-[0.05em] text-white uppercase sm:text-[48px]">
            Indoor Golf Rankings
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-white/70">
            One ranking for the whole building. Every league night, open tournament, and skins game
            we score feeds the same points table, so you always know where your game stands against
            the rest of the center.
          </p>
        </div>

        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[5px] bg-sdgc-red" />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Fact strip                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-black/10 bg-[#111]">
        <dl className="mx-auto grid w-[85%] max-w-[1180px] grid-cols-2 gap-y-2 py-8 lg:grid-cols-4 lg:gap-y-0 lg:divide-x lg:divide-white/10">
          {RANKING_FACTS.map((fact) => (
            <div key={fact.label} className="px-4 py-3 text-center">
              <dt className="font-sans text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase">
                {fact.label}
              </dt>
              <dd className="mt-2 font-display text-[19px] leading-tight font-semibold text-white">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The table, with the rules alongside it                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-[#f4f4f4] py-16 sm:py-20">
        <div className="mx-auto grid w-[85%] max-w-[1180px] grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {/* Painted above the widget (and opaque) so the rule under it survives
                the negative margin that tucks the widget's blank top edge under. */}
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-3 border-b border-black/10 bg-white px-6 py-5 sm:px-8">
              <div>
                <h2 className="font-display text-[24px] leading-none font-bold tracking-[0.05em] text-sdgc-ink uppercase">
                  Current Ranking
                </h2>
                <p className="mt-2 text-[13px] text-sdgc-body">
                  Live points table, recalculated after every scored event
                </p>
              </div>
              <span className="rounded-full bg-black px-3 py-1 font-sans text-[10px] font-bold tracking-[0.14em] text-white uppercase">
                Powered by Front9
              </span>
            </div>
            <div className="-mt-4 px-2 pb-2 sm:px-4 sm:pb-4">
              <Front9Embed
                org={RANKINGS.org}
                widget="standings"
                options={{
                  title: " ",
                  series: RANKINGS.series,
                  accent: "#e11414",
                }}
              />
            </div>
          </div>

          {/* Rules rail — stacks under the table on narrow screens */}
          <aside className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-8 lg:sticky lg:top-[calc(var(--sdgc-header-h)+24px)]">
            <h2 className="font-display text-[20px] leading-none font-bold tracking-[0.05em] text-sdgc-ink uppercase">
              How It Works
            </h2>
            <div className="mt-3 h-[3px] w-12 bg-sdgc-red" />

            <ol className="mt-6 space-y-6">
              {RANKING_RULES.map((rule, i) => (
                <li key={rule.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black font-sans text-[12px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-sans text-[13px] font-bold tracking-[0.08em] text-sdgc-ink uppercase">
                      {rule.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-[1.7] text-sdgc-body">{rule.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href="/#leagues"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-sdgc-red px-6 py-3 font-sans text-[12px] font-bold tracking-[2px] text-white uppercase transition-colors duration-300 hover:bg-[#c62222]"
            >
              Get in a League
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
