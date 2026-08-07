import type { Metadata } from "next";
import Link from "next/link";
import Front9Embed from "@/components/Front9Embed";

export const metadata: Metadata = {
  title: "Blog | Seth Dichard Golf Centers",
  description: "News, recaps, and tips from the Seth Dichard Golf Center in Hudson, NH.",
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  // embed.js reads the slug straight off location.search (data-post="url"), but
  // we thread it through as a key so a client-side nav to a different post
  // re-injects the widget instead of leaving the old article mounted.
  const { id } = await searchParams;
  const postId = Array.isArray(id) ? id[0] : id;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b-[5px] border-sdgc-red bg-black">
        <div className="mx-auto w-[85%] max-w-[900px] py-12 sm:py-16">
          <Link
            href="/#schedule"
            className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold tracking-[0.16em] text-white/60 uppercase transition-colors duration-300 hover:text-white"
          >
            <ArrowLeftIcon />
            All Posts
          </Link>
          <p className="mt-8 font-sans text-[12px] font-semibold tracking-[0.3em] text-sdgc-red uppercase">
            Seth Dichard Golf Centers
          </p>
          <h1 className="mt-3 font-display text-[34px] leading-[1.08] font-bold tracking-[0.06em] text-white uppercase sm:text-[46px]">
            From the Blog
          </h1>
        </div>
      </section>

      <section className="bg-[#f4f4f4] py-14 sm:py-20">
        <div className="mx-auto w-[85%] max-w-[900px]">
          <article className="overflow-hidden rounded-sm border border-black/10 bg-white px-4 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:px-10 sm:py-10">
            <Front9Embed
              key={postId ?? "latest"}
              org="seth-dichard-golf-centers"
              widget="blog-post"
              options={{
                post: "url",
                postParam: "id",
                preset: "classic",
              }}
            />
          </article>

          <div className="mt-10 text-center">
            <Link
              href="/#schedule"
              className="inline-block rounded-full bg-sdgc-red px-7 py-3 font-sans text-[13px] font-bold tracking-[2px] text-white uppercase transition-colors duration-300 hover:bg-[#c62222]"
            >
              Back to All Posts
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
