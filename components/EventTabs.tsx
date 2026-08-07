"use client";

import { useEffect, useState } from "react";
import Front9Embed from "@/components/Front9Embed";

const ORG = "seth-dichard-golf-centers";
const ACCENT = "#e11414";

/** Tab id doubles as the URL hash. */
const TABS = [
  { id: "details", label: "Details", widget: "event-detail" },
  { id: "field", label: "Field", widget: "field" },
  { id: "tee-times", label: "Tee Times", widget: "tee-times" },
  { id: "leaderboard", label: "Leaderboard", widget: "leaderboard" },
  { id: "odds", label: "Odds", widget: "odds" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DEFAULT_TAB: TabId = "details";

function tabFromHash(): TabId {
  const hash = window.location.hash.replace(/^#/, "");
  return TABS.some((t) => t.id === hash) ? (hash as TabId) : DEFAULT_TAB;
}

export default function EventTabs({ eventId }: { eventId?: string }) {
  const [active, setActive] = useState<TabId>(DEFAULT_TAB);
  // Widgets mount on first visit and stay mounted, so switching back to a tab
  // doesn't refetch the iframe.
  const [mounted, setMounted] = useState<Set<TabId>>(() => new Set([DEFAULT_TAB]));

  useEffect(() => {
    const sync = () => {
      const next = tabFromHash();
      setActive(next);
      setMounted((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <>
      {/* Tab bar pins just below the fixed site header */}
      <nav
        className="sticky z-30 border-b border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        style={{ top: "var(--sdgc-header-h)" }}
        aria-label="Event sections"
      >
        <ul className="mx-auto flex w-[85%] max-w-[1180px] gap-1 overflow-x-auto sm:gap-2">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <li key={tab.id}>
                <a
                  href={`#${tab.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`block border-b-[3px] px-4 py-4 font-sans text-[12px] font-bold tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200 sm:px-6 sm:text-[13px] ${
                    isActive
                      ? "border-sdgc-red text-sdgc-ink"
                      : "border-transparent text-black/45 hover:text-sdgc-ink"
                  }`}
                >
                  {tab.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="bg-[#f4f4f4] py-12 sm:py-16">
        <div className="mx-auto w-[85%] max-w-[1180px]">
          {eventId ? (
            <div className="overflow-hidden rounded-sm border border-black/10 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-6">
              {TABS.filter((tab) => mounted.has(tab.id)).map((tab) => (
                <div key={tab.id} className={tab.id === active ? "block" : "hidden"}>
                  <Front9Embed
                    org={ORG}
                    widget={tab.widget}
                    options={{ event: "url", eventParam: "id", accent: ACCENT }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-black/20 bg-white px-8 py-16 text-center">
              <h2 className="font-display text-[24px] font-bold tracking-[0.05em] text-sdgc-ink uppercase">
                No Event Selected
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-[1.8] text-sdgc-body">
                This page needs an event in the URL, for example{" "}
                <code className="rounded bg-black/5 px-1.5 py-0.5 text-[13px]">
                  /event?id=2026-the-turkey-day-shootout
                </code>
                .
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
