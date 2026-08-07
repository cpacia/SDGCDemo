import type { Metadata } from "next";
import { Open_Sans, Oswald, Poppins } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leagues & Events | Seth Dichard Golf Centers",
  description:
    "Indoor golf leagues, tournaments, and news at the Seth Dichard Golf Center in Hudson, NH.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${poppins.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {/* Offsets the fixed header; the var is published by SiteHeader. */}
        <main className="flex-1" style={{ paddingTop: "var(--sdgc-header-h)" }}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
