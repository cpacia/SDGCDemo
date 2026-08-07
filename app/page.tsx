import Image from "next/image";
import Link from "next/link";
import Front9Embed from "@/components/Front9Embed";
import LeagueCard from "@/components/LeagueCard";
import SectionHeading from "@/components/SectionHeading";
import { LEAGUES } from "@/lib/leagues";
import { RANKING_FACTS } from "@/lib/rankings";

const STATS = [
  { value: "8", label: "Active Leagues" },
  { value: "140+", label: "Registered Players" },
  { value: "6", label: "Simulator Bays" },
  { value: "365", label: "Days a Year" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 px-6 py-5 sm:px-8">
      <div>
        <h3 className="font-display text-[24px] leading-none font-bold tracking-[0.05em] text-sdgc-ink uppercase">
          {title}
        </h3>
        <p className="mt-2 text-[13px] text-sdgc-body">{subtitle}</p>
      </div>
      <span className="rounded-full bg-black px-3 py-1 font-sans text-[10px] font-bold tracking-[0.14em] text-white uppercase">
        Powered by Front9
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          src="/brand/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.7)_45%,rgba(0,0,0,0.35)_100%)]"
        />

        <div className="relative mx-auto w-[85%] max-w-[1180px] py-20 sm:py-28 lg:py-32">
          <p className="font-sans text-[12px] font-semibold tracking-[0.3em] text-sdgc-red uppercase">
            Hudson, NH &middot; Indoor Golf, Year Round
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-[40px] leading-[1.05] font-bold tracking-[0.08em] text-white uppercase sm:text-[58px] lg:text-[72px]">
            Leagues &amp; <span className="text-sdgc-red">Tournaments</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.9] text-white/75 sm:text-[16px]">
            Eight leagues running across seven nights, plus a full tournament calendar. Pick your
            night, pick your format, and keep your swing sharp straight through the winter.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#leagues"
              className="rounded-full bg-sdgc-red px-8 py-3 font-sans text-[13px] font-bold tracking-[2px] text-white uppercase transition-colors duration-300 hover:bg-[#c62222]"
            >
              Browse Leagues
            </a>
            <a
              href="#schedule"
              className="rounded-full border-2 border-white/35 px-8 py-3 font-sans text-[13px] font-bold tracking-[2px] text-white uppercase transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              Tournament Schedule
            </a>
          </div>
        </div>

        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[5px] bg-sdgc-red" />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Stats strip                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-black/10 bg-[#111]">
        <dl className="mx-auto grid w-[85%] max-w-[1180px] grid-cols-2 gap-y-2 py-8 lg:grid-cols-4 lg:gap-y-0 lg:divide-x lg:divide-white/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col justify-start px-4 py-3 text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-[34px] leading-none font-bold text-white">
                  {stat.value}
                </span>
                <span className="mt-2 block font-sans text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Leagues                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="leagues" className="scroll-mt-40 bg-white py-20 sm:py-24">
        <div className="mx-auto w-[85%] max-w-[1180px]">
          <SectionHeading
            eyebrow="Choose Your Night"
            title="Our Leagues"
            intro="Every league runs on our simulators with live scoring, weekly standings, and full season handicapping. Click any league for schedules, standings, and registration."
          />

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {LEAGUES.map((league) => (
              <LeagueCard key={league.slug} league={league} />
            ))}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Rankings promo — the one link to the facility-wide ranking page    */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          src="/brand/hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-20"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.82)_55%,rgba(0,0,0,0.5)_100%)]"
        />

        <div className="relative mx-auto grid w-[85%] max-w-[1180px] grid-cols-1 items-center gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div>
            <p className="font-sans text-[12px] font-semibold tracking-[0.28em] text-sdgc-red uppercase">
              Facility-Wide
            </p>
            <h2 className="mt-3 font-display text-[34px] leading-[1.1] font-bold tracking-[0.06em] text-white uppercase sm:text-[42px]">
              Indoor Golf Rankings
            </h2>
            <div className="mt-4 h-[3px] w-16 bg-sdgc-red" />
            <p className="mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70">
              Every league night and open tournament we score feeds one points table. It is our
              version of the world ranking, run across the whole center — see where your game sits
              against everyone else who plays here.
            </p>

            <Link
              href="/rankings"
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-sdgc-red px-8 py-3 font-sans text-[13px] font-bold tracking-[2px] text-white uppercase transition-colors duration-300 hover:bg-[#c62222]"
            >
              View the Rankings
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </Link>
          </div>

          {/* Glance panel — same facts the ranking page opens with */}
          <dl className="rounded-sm border border-white/15 bg-white/[0.04] px-6 py-2 backdrop-blur-sm sm:px-8">
            {RANKING_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-4 py-4 not-first:border-t not-first:border-white/10"
              >
                <dt className="font-sans text-[11px] font-semibold tracking-[0.16em] text-white/45 uppercase">
                  {fact.label}
                </dt>
                <dd className="text-right font-display text-[17px] leading-tight font-semibold text-white">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[5px] bg-sdgc-red" />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Front9 widgets — blog feed + tournament schedule                   */}
      {/* ------------------------------------------------------------------ */}
      <section id="schedule" className="scroll-mt-40 bg-[#f4f4f4] py-20 sm:py-24">
        <div className="mx-auto w-[85%] max-w-[1180px]">
          <SectionHeading
            eyebrow="What&rsquo;s Happening"
            title="News &amp; Events"
            intro="The latest from the center, plus every non-league tournament on the calendar this season."
          />

          <div className="mt-14 grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <PanelHeader title="From the Blog" subtitle="News, recaps, and tips from our staff" />
              <div className="p-2 sm:p-4">
                <Front9Embed
                  org="seth-dichard-golf-centers"
                  widget="blog-feed"
                  options={{
                    preset: "featured-sidebar",
                    posts: "15",
                    link: "http://localhost:3000/blog?id={slug}",
                  }}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <PanelHeader
                title="Tournament Schedule"
                subtitle="Open events — no league membership required"
              />
              <div className="p-2 sm:p-4">
                <Front9Embed
                  org="seth-dichard-golf-centers"
                  widget="schedule"
                  options={{
                    title: " ",
                    filter: "all",
                    tags: "tournaments",
                    actions: "1",
                    accent: "#e11414",
                    link: "http://localhost:3000/event?id={slug}",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
