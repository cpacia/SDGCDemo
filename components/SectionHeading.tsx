export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="font-sans text-[12px] font-semibold tracking-[0.28em] text-sdgc-red uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[34px] leading-[1.1] font-bold tracking-[0.06em] text-sdgc-ink uppercase sm:text-[42px]">
        {title}
      </h2>
      <div className={`mt-4 h-[3px] w-16 bg-sdgc-red ${centered ? "mx-auto" : ""}`} />
      {intro && <p className="mt-5 text-[15px] leading-[1.8] text-sdgc-body">{intro}</p>}
    </div>
  );
}
