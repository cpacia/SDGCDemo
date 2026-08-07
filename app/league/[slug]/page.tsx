import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Front9Embed from "@/components/Front9Embed";
import { LEAGUES } from "@/lib/leagues";
import { CONTACT } from "@/lib/nav";

export function generateStaticParams() {
  return LEAGUES.map((league) => ({ slug: league.slug }));
}

export async function generateMetadata({ params }: PageProps<"/league/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const league = LEAGUES.find((l) => l.slug === slug);
  if (!league) return { title: "League Not Found | Seth Dichard Golf Centers" };

  return {
    title: `${league.name} | Seth Dichard Golf Centers`,
    description: league.blurb,
  };
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 px-6 py-5 sm:px-8">
        <div>
          <h2 className="font-display text-[24px] leading-none font-bold tracking-[0.05em] text-sdgc-ink uppercase">
            {title}
          </h2>
          <p className="mt-2 text-[13px] text-sdgc-body">{subtitle}</p>
        </div>
        <span className="rounded-full bg-black px-3 py-1 font-sans text-[10px] font-bold tracking-[0.14em] text-white uppercase">
          Powered by Front9
        </span>
      </div>
      <div className="p-2 sm:p-4">{children}</div>
    </div>
  );
}

export default async function LeaguePage({ params }: PageProps<"/league/[slug]">) {
  const { slug } = await params;
  const league = LEAGUES.find((l) => l.slug === slug);
  if (!league) notFound();

  const full = league.spotsOpen === 0;
  const facts = [
    { label: "Plays", value: `${league.day}, ${league.time}` },
    { label: "Format", value: league.format },
    { label: "Season", value: league.season },
    { label: "Field", value: `${league.teams} teams` },
  ];

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* League header                                                      */}
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
            href="/#leagues"
            className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold tracking-[0.16em] text-white/60 uppercase transition-colors duration-300 hover:text-white"
          >
            <ArrowLeftIcon />
            All Leagues
          </Link>

          <div className="mt-8 flex flex-col items-start gap-7 sm:flex-row sm:items-center">
            <Image
              src={league.logo}
              alt=""
              width={240}
              height={240}
              priority
              className="h-[104px] w-[104px] shrink-0 sm:h-[132px] sm:w-[132px]"
            />
            <div>
              <p
                className="font-sans text-[12px] font-semibold tracking-[0.28em] uppercase"
                style={{ color: league.accent }}
              >
                {league.format}
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-[34px] leading-[1.08] font-bold tracking-[0.05em] text-white uppercase sm:text-[48px]">
                {league.name}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-[1.85] text-white/70">
                {league.blurb}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={CONTACT.bookNow}
              className={`rounded-full px-8 py-3 font-sans text-[13px] font-bold tracking-[2px] uppercase transition-colors duration-300 ${
                full
                  ? "cursor-not-allowed bg-white/15 text-white/50"
                  : "bg-sdgc-red text-white hover:bg-[#c62222]"
              }`}
              aria-disabled={full}
            >
              {full ? "League Full — Join Waitlist" : `Register — ${league.spotsOpen} Spots Open`}
            </a>
            <a
              href={CONTACT.phoneHref}
              className="rounded-full border-2 border-white/35 px-8 py-3 font-sans text-[13px] font-bold tracking-[2px] text-white uppercase transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              {CONTACT.phone}
            </a>
          </div>
        </div>

        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[5px]"
          style={{ backgroundColor: league.accent }}
        />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Fact strip                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-black/10 bg-[#111]">
        <dl className="mx-auto grid w-[85%] max-w-[1180px] grid-cols-2 gap-y-2 py-8 lg:grid-cols-4 lg:gap-y-0 lg:divide-x lg:divide-white/10">
          {facts.map((fact) => (
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
      {/* Front9 schedule + standings                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-[#f4f4f4] py-16 sm:py-20">
        <div className="mx-auto w-[85%] max-w-[1180px]">
          {league.front9 ? (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <Panel title="Schedule" subtitle="Every week of the season, with course and tee time">
                <Front9Embed
                  org={league.front9.org}
                  widget="schedule"
                  options={{
                    title: " ",
                    filter: "all",
                    actions: "1",
                    noregister: "1",
                    tags: league.front9.scheduleTags,
                    link: "http://localhost:3000/event?id={slug}",
                  }}
                />
              </Panel>

              <Panel title="Standings" subtitle="Live season points, updated after every week">
                <Front9Embed
                  org={league.front9.org}
                  widget="standings"
                  options={{
                    title: " ",
                    series: league.front9.standingsSeries,
                  }}
                />
              </Panel>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-black/20 bg-white px-8 py-16 text-center">
              <h2 className="font-display text-[24px] font-bold tracking-[0.05em] text-sdgc-ink uppercase">
                Schedule &amp; Standings Coming Soon
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-[1.8] text-sdgc-body">
                This league hasn&rsquo;t been set up in Front9 yet. Once it is, the weekly schedule
                and live standings will appear here automatically.
              </p>
              <Link
                href="/#leagues"
                className="mt-7 inline-block rounded-full bg-sdgc-red px-7 py-3 font-sans text-[13px] font-bold tracking-[2px] text-white uppercase transition-colors duration-300 hover:bg-[#c62222]"
              >
                Back to Leagues
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
