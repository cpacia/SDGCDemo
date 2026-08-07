import type { Metadata } from "next";
import Link from "next/link";
import EventTabs from "@/components/EventTabs";

export const metadata: Metadata = {
  title: "Event | Seth Dichard Golf Centers",
  description: "Details, field, tee times, leaderboard, and odds for the event.",
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Front9 slugs are derived from the event title and prefixed with the season
 * year ("2026-the-turkey-day-shootout"), so this reads back cleanly enough for
 * the page heading. The widgets carry the authoritative title.
 */
function titleFromSlug(slug?: string) {
  if (!slug) return "Event";
  return (
    slug
      .replace(/^\d{4}-/, "")
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "Event"
  );
}

export default async function EventPage({ searchParams }: PageProps<"/event">) {
  const { id } = await searchParams;
  const eventId = Array.isArray(id) ? id[0] : id;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b-[5px] border-sdgc-red bg-black">
        <div className="mx-auto w-[85%] max-w-[1180px] py-12 sm:py-16">
          <Link
            href="/#schedule"
            className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold tracking-[0.16em] text-white/60 uppercase transition-colors duration-300 hover:text-white"
          >
            <ArrowLeftIcon />
            All Events
          </Link>
          <p className="mt-8 font-sans text-[12px] font-semibold tracking-[0.3em] text-sdgc-red uppercase">
            Seth Dichard Golf Centers
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-[32px] leading-[1.08] font-bold tracking-[0.05em] text-white uppercase sm:text-[44px]">
            {titleFromSlug(eventId)}
          </h1>
        </div>
      </section>

      <EventTabs eventId={eventId} />
    </>
  );
}
