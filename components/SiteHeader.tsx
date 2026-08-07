"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONTACT, NAV, type NavItem } from "@/lib/nav";

/* Divi renders these as ETmodules/FontAwesome glyphs; inlined as SVG here. */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[14px] w-[14px] shrink-0">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.5.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.4.57 3.5a1 1 0 0 1-.25 1l-2.22 2.3Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[14px] w-[14px] shrink-0">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Publishes the rendered header height so `<main>` can offset the fixed bar. */
function useHeaderHeightVar(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--sdgc-header-h", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
}

function DesktopNavItem({ item }: { item: NavItem }) {
  const hasChildren = !!item.children?.length;

  return (
    <li className="group relative flex items-stretch">
      <Link
        href={item.href}
        className="flex items-center gap-1 py-2 text-[13px] font-semibold uppercase tracking-[0.1vw] text-white transition-colors duration-200 hover:text-white/70 xl:text-[14px]"
      >
        {item.label}
        {hasChildren && (
          <ChevronIcon className="h-3 w-3 opacity-60 transition-transform duration-200 group-hover:rotate-180" />
        )}
      </Link>

      {hasChildren && (
        <div className="invisible absolute top-full left-0 z-50 w-[260px] translate-y-1 border-t-[3px] border-sdgc-red bg-black opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <ul className="py-2">
            {item.children!.map((child) => (
              <li key={child.label}>
                <Link
                  href={child.href}
                  className="block px-5 py-2 text-[13px] leading-snug font-medium text-white transition-colors duration-200 hover:text-sdgc-red"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  return (
    <li className="border-b border-sdgc-red/40">
      <div className="flex items-center justify-between">
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex-1 py-3 text-[14px] font-semibold uppercase tracking-wide text-white"
        >
          {item.label}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`Toggle ${item.label} submenu`}
            className="p-3 text-white/70"
          >
            <ChevronIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {hasChildren && open && (
        <ul className="pb-2 pl-4">
          {item.children!.map((child) => (
            <li key={child.label}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className="block py-2 text-[13px] text-white/75 hover:text-sdgc-red"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  useHeaderHeightVar(headerRef);

  /* Lock body scroll while the mobile drawer is open. */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 right-0 left-0 z-50 py-[2vw] lg:py-[1.2vw]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, #000000 50%, rgba(102,20,20,1) 87%, #e02b2b 96%)",
      }}
    >
      {/* Utility row — hidden below 768px on the live site */}
      <div className="mx-auto hidden w-[85%] max-w-[1790px] items-center gap-6 md:flex lg:w-[62%] xl:w-[48%]">
        <div className="flex flex-1 items-center gap-2 font-sans text-[12px] font-semibold text-white">
          <span className="text-sdgc-red">
            <PhoneIcon />
          </span>
          <a href={CONTACT.phoneHref} className="hover:text-sdgc-red">
            {CONTACT.phone}
          </a>
        </div>

        <div className="flex flex-1 items-center gap-2 font-sans text-[13px] font-semibold text-white">
          <span className="text-sdgc-red">
            <MailIcon />
          </span>
          <a
            href={`mailto:${CONTACT.email}`}
            className="transition-colors duration-300 hover:text-sdgc-red"
          >
            {CONTACT.email}
          </a>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <a
            href={CONTACT.giftCertificates}
            className="group flex items-center gap-2 font-sans text-[13px] font-semibold text-sdgc-green transition-colors duration-300 hover:text-sdgc-red"
          >
            <Image
              src="/brand/gift-certificate.png"
              alt=""
              width={96}
              height={66}
              className="h-auto w-[22px]"
            />
            Gift Certificates
          </a>
        </div>
      </div>

      {/* Logo / menu / CTA row */}
      <div className="mx-auto flex w-full items-center gap-4 px-5 py-[1vw] lg:px-8">
        <div className="flex w-[38vw] shrink-0 justify-start md:w-[26vw] lg:w-[16vw] xl:w-[14vw]">
          <Link href="/" className="block w-full">
            <Image
              src="/brand/sdgc-logo.png"
              alt="Seth Dichard Golf Centers"
              width={464}
              height={182}
              priority
              className="h-auto w-full max-w-[240px]"
            />
          </Link>
        </div>

        <nav className="hidden flex-1 lg:block">
          <ul className="flex flex-wrap items-stretch gap-x-6 xl:gap-x-8">
            {NAV.map((item) => (
              <DesktopNavItem key={item.label} item={item} />
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <a
            href={CONTACT.bookNow}
            className="sdgc-wiggle rounded-full bg-sdgc-red px-5 py-1 font-sans text-[13px] font-bold tracking-[2px] whitespace-nowrap text-white uppercase transition-colors duration-300 hover:bg-[#c62222] lg:text-[16px] xl:px-6 xl:text-[20px]"
          >
            Book Now
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            className="p-1 text-white lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer — black panel with the red rules Divi uses */}
      {mobileOpen && (
        <div className="absolute top-full right-0 left-0 max-h-[70vh] overflow-y-auto border-t-[3px] border-sdgc-red bg-black px-6 pb-6 lg:hidden">
          <ul>
            {NAV.map((item) => (
              <MobileNavItem key={item.label} item={item} onNavigate={() => setMobileOpen(false)} />
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2 font-sans text-[13px] font-semibold text-white">
            <a href={CONTACT.phoneHref} className="flex items-center gap-2">
              <span className="text-sdgc-red">
                <PhoneIcon />
              </span>
              {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2">
              <span className="text-sdgc-red">
                <MailIcon />
              </span>
              {CONTACT.email}
            </a>
            <a href={CONTACT.giftCertificates} className="text-sdgc-green">
              Gift Certificates
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
