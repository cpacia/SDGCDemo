"use client";

import { useEffect, useRef } from "react";

/**
 * Drops the stock Front9 embed snippet into the page.
 *
 * embed.js reads `document.currentScript`, builds an iframe URL from the
 * data-* attributes, and inserts the iframe as the script tag's next sibling —
 * so the script has to live inside the container we want the widget in.
 * Height is synced back over postMessage by the loader itself.
 */
export type Front9EmbedProps = {
  /** Front9 organization slug, e.g. "seth-dichard-golf-centers". */
  org: string;
  /** Widget name, e.g. "blog-feed" or "schedule". */
  widget: string;
  /** Any other data-* options; camelCase keys become dashed attributes. */
  options?: Record<string, string>;
  className?: string;
};

const EMBED_SRC = "https://front9.com/embed.js";

function toDataAttr(key: string) {
  return `data-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

export default function Front9Embed({ org, widget, options, className }: Front9EmbedProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  /* Serialized so the effect re-runs if a caller changes an option. */
  const optionsKey = JSON.stringify(options ?? {});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // embed.js resolves `document.currentScript` when it executes, which is
    // well after we append it. Yanking a still-pending script back out (as a
    // StrictMode double-invoke would) leaves it with a null parentNode and the
    // loader throws — so inject at most once per prop set and never tear down.
    const key = `${org}|${widget}|${optionsKey}`;
    if (host.dataset.f9Key === key) return;
    host.dataset.f9Key = key;
    host.replaceChildren();

    const script = document.createElement("script");
    script.async = true;
    script.src = EMBED_SRC;
    script.setAttribute("data-org", org);
    script.setAttribute("data-widget", widget);
    for (const [key, value] of Object.entries(JSON.parse(optionsKey) as Record<string, string>)) {
      script.setAttribute(toDataAttr(key), value);
    }

    host.appendChild(script);
  }, [org, widget, optionsKey]);

  return <div ref={hostRef} className={`f9-embed ${className ?? ""}`} />;
}
