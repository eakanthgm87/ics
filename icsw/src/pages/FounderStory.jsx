import { Link } from "react-router-dom";
import { Reveal } from "../components/common";
import { IconArrowRight, IconChevronDown } from "../components/Icons";
import { useContent, useSection } from "../api";
import CONTENT from "../data/content.json";

export default function FounderStory() {
  const CHAPTERS = useContent("/chapters/", CONTENT.chapters);
  const hero = useSection("founder-hero");

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden bg-white py-12 lg:py-20">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-[120px] -top-[120px] h-80 w-80 rounded-full bg-brand/10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[140px] -left-[90px] h-[260px] w-[260px] rounded-full bg-ink/[0.07]"
        />

        <div className="shell relative">
          <div className="flex flex-col items-start gap-6 overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-[0_18px_48px_-16px_rgba(38,65,48,0.22)] sm:p-10 lg:p-14">
            <div className="flex w-full items-center gap-2.5">
              <span className="h-px flex-1 bg-brand/90" />
              <span className="h-2.5 w-2.5 rotate-45 bg-brand" />
              <span className="h-px flex-1 bg-brand/90" />
            </div>

            <div className="flex w-full flex-col items-center gap-5">
              <h1 className="text-center font-poppins text-[34px] font-bold leading-[1.05] sm:text-[52px] lg:text-7xl">
                {hero.title}
              </h1>
              <p className="subhead text-center text-base text-body sm:text-xl">
                {hero.subtitle}
              </p>
              <div className="flex w-full flex-col gap-2.5 rounded-2xl border-l-[5px] border-brand bg-tint px-5 py-5">
                <p className="subhead text-center text-base text-ink sm:text-lg">
                  &quot;{hero.quote}&quot;
                </p>
                <p className="text-center font-poppins text-[13px] font-bold text-muted">
                  {hero.eyebrow}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2.5">
              <span className="h-px flex-1 bg-brand/90" />
              <span className="h-2.5 w-2.5 rotate-45 bg-brand" />
              <span className="h-px flex-1 bg-brand/90" />
            </div>

            <a
              href="#chapter-1"
              className="mx-auto flex items-center gap-2 font-poppins text-sm font-bold text-ink transition-colors hover:text-brand"
            >
              Begin the chronicle
              <IconChevronDown size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- chapters */}
      {CHAPTERS.map((c, i) => (
        <section
          key={c.title}
          id={`chapter-${i + 1}`}
          className="relative scroll-mt-24 bg-white py-14 lg:py-20"
        >
          <span className="absolute left-1/2 top-0 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border border-line bg-white text-brand shadow-[0_6px_16px_-8px_rgba(38,65,48,0.25)] lg:flex">
            <IconChevronDown />
          </span>

          <div className="shell grid items-center gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_520px] lg:gap-12">
            <Reveal
              className={[
                "framed h-[280px] w-full shadow-[0_14px_32px_-14px_rgba(38,65,48,0.25)] sm:h-[400px] lg:h-[560px]",
                i % 2 ? "lg:order-2" : "",
              ].join(" ")}
            >
              <img
                src={c.img}
                alt={c.alt}
                className="h-full w-full rounded-xl object-cover"
                loading="lazy"
              />
            </Reveal>

            <div
              className={[
                "flex flex-col items-start gap-4 rounded-3xl border border-line bg-white p-6 shadow-[0_14px_32px_-14px_rgba(38,65,48,0.25)] sm:p-8",
                i % 2 ? "lg:order-1" : "",
              ].join(" ")}
            >
              <span className="h-[5px] w-16 rounded-full bg-brand" />
              <h2 className="font-poppins text-[26px] font-bold leading-tight sm:text-[32px] lg:text-4xl">
                {c.title}
              </h2>
              <p className="copy-justify font-arsenal text-base leading-[1.6] text-body">
                {c.text}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {i === CHAPTERS.length - 1 ? (
                  <Link
                    to="/life-at-ics"
                    className="btn rounded-lg bg-ink px-5 py-3 text-white shadow-[0_10px_24px_-10px_rgba(38,65,48,0.6)] hover:bg-[#1b3123]"
                  >
                    Explore the campus
                    <IconArrowRight />
                  </Link>
                ) : null}
                {c.badge ? (
                  <span className="rounded-lg border border-transparent bg-ink px-4 py-2.5 font-poppins text-[13px] font-bold text-white">
                    {c.badge}
                  </span>
                ) : null}
                {c.tag ? (
                  <span className="rounded-lg border border-line bg-tint px-4 py-2.5 font-poppins text-[13px] font-bold text-ink">
                    {c.tag}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <span className="absolute inset-x-0 bottom-0 mx-auto block w-[calc(100%-40px)] border-b border-dashed border-line" />
        </section>
      ))}

    </>
  );
}
