import { useState } from "react";
import { Link } from "react-router-dom";
import { CountUp, DoodleLayer, Reveal } from "../components/common";
import { useBrochure, useContent, useSection } from "../api";
import CONTENT from "../data/content.json";
import {
  IconArrowRight,
  IconAward,
  IconCalendar,
  IconFlask,
  IconPalette,
  IconPin,
  IconUsers,
} from "../components/Icons";

/* The API sends an icon *name*; map it to the component. */
const ICONS = {
  calendar: IconCalendar,
  users: IconUsers,
  award: IconAward,
  pin: IconPin,
  flask: IconFlask,
  palette: IconPalette,
};

/* --------------------------------------------------------- home hero --
   The photo stays bright on the right; a deep forest-green fade from the
   left carries the copy. The last "Since ..." part of the title is set in
   gold. All text comes from /admin → Page text & images → "Home — hero". */
function HomeHero({ hero, brochure }) {
  const m = hero.title.match(/^(.*?)\s+(since\s.+)$/i);
  const [lead, accent] = m ? [m[1], m[2]] : [hero.title, ""];

  return (
    <div className="framed">
      <div className="relative flex min-h-[560px] flex-col justify-center overflow-hidden rounded-xl sm:min-h-[520px] lg:min-h-[600px]">
        <img
          src={hero.img}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        {/* green fade: solid behind the copy, clear over the right of the photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,40,26,0.92)_0%,rgba(16,40,26,0.78)_55%,rgba(16,40,26,0.35)_100%)] sm:bg-[linear-gradient(100deg,rgba(14,36,23,0.95)_0%,rgba(18,44,29,0.86)_32%,rgba(22,52,34,0.45)_55%,rgba(22,52,34,0)_75%)]"
        />

        {/* est. seal */}
        <span className="absolute right-5 top-5 hidden h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-[#173a26] text-center font-poppins font-bold leading-none text-white shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] ring-2 ring-white/15 sm:flex lg:right-8 lg:top-8">
          <span className="text-[10px] tracking-[0.14em] text-white/80">EST.</span>
          <span className="mt-1 text-base">1979</span>
          <span className="mt-1.5 h-[2px] w-6 rounded-full bg-brand" />
        </span>

        <div className="relative flex max-w-[760px] flex-col items-start gap-5 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          {hero.eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4c8a5f]/70 bg-[#0e2a1a]/80 px-4 py-2 font-poppins text-[11px] font-bold uppercase tracking-[0.12em] text-white sm:text-xs">
              <IconCap />
              {hero.eyebrow}
            </span>
          ) : null}

          <h1 className="font-poppins text-[40px] font-bold leading-[1.05] tracking-tight text-white sm:text-[56px] lg:text-[64px]">
            {lead}
            {accent ? (
              <span className="block text-brand">
                {accent}
              </span>
            ) : null}
          </h1>

          <p className="max-w-[540px] font-poppins text-base leading-[1.65] text-white/90 sm:text-[17px]">
            {hero.body}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to="/admissions#registration"
              className="btn bg-brand px-7 py-3.5 text-white shadow-[0_12px_26px_-10px_rgba(163,117,65,0.8)] hover:bg-[#8f6435]"
            >
              Enquire Now
              <IconArrowRight />
            </Link>
            <a
              href={brochure}
              download
              className="btn bg-white px-7 py-3.5 text-[#14281c] shadow-[0_12px_26px_-12px_rgba(0,0,0,0.5)] hover:bg-tint"
            >
              Download Brochure
              <IconDownload />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const IconCap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-6.82 9.66L5 16c0 1.66 3.13 3 7 3s7-1.34 7-3l-.18-3.34L12 16.5l-6.82-3.84Z" />
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
  </svg>
);

/* records where the cursor is, for the stat cards' spotlight */
const spotlight = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

export default function Home() {
  /* `from` lets the founding year count down from the present day while the
     rest of the tiles count up from zero. */
  const STATS = useContent("/stats/", CONTENT.stats);
  const PROGRAMS = useContent("/programs/", CONTENT.programs);
  const hero = useSection("home-hero");
  const cta = useSection("home-cta");
  const brochure = useBrochure();
  const [replay, setReplay] = useState({});

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="bg-white py-8 lg:py-16">
        <div className="shell">
          <HomeHero hero={hero} brochure={brochure} />
        </div>
      </section>

      {/* ----------------------------------------------------------- stats */}
      <section className="bg-white pb-12 lg:pb-20">
        <div className="shell grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
          {STATS.map(({ icon, to, from, suffix, grouped, label }, i) => {
            const Icon = ICONS[icon] ?? IconAward;
            return (
            <Reveal
              key={label}
              className="h-full"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              {/* hover lives on this inner card: .reveal owns the outer
                  element's transition, which would cancel the lift */}
              <div
                tabIndex={0}
                onMouseMove={spotlight}
                onMouseEnter={() => setReplay((r) => ({ ...r, [label]: (r[label] ?? 0) + 1 }))}
                className="group relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-[20px] border border-line bg-white px-6 py-8 shadow-[0_12px_24px_-10px_rgba(38,65,48,0.18)] outline-none transition-[translate,box-shadow,border-color] duration-500 ease-out hover:-translate-y-2 hover:border-ink/15 hover:shadow-[0_30px_50px_-22px_rgba(38,65,48,0.45)] focus-visible:-translate-y-2 focus-visible:border-ink/15"
              >
                <span className="absolute inset-x-0 top-0 h-1.5 bg-ink" />
                {/* corner circle grows into a soft green wash */}
                <span className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-tint transition-transform duration-700 ease-out group-hover:scale-[3.2] group-focus-visible:scale-[3.2]" />
                {/* spotlight that follows the cursor */}
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(220px_circle_at_var(--mx,50%)_var(--my,50%),rgba(163,117,65,0.16),transparent_65%)] group-hover:opacity-100" />

                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-ink shadow-[0_8px_18px_-10px_rgba(38,65,48,0.5)] transition-all duration-500 ring-0 ring-ink/10 group-hover:-translate-y-1.5 group-hover:bg-ink group-hover:text-white group-hover:ring-[7px] group-focus-visible:-translate-y-1.5 group-focus-visible:bg-ink group-focus-visible:text-white group-focus-visible:ring-[7px]">
                  <Icon size={24} />
                </span>
                <CountUp
                  key={replay[label] ?? 0 /* count again on each hover */}
                  to={to}
                  from={from}
                  suffix={suffix}
                  grouped={grouped}
                  duration={replay[label] ? 1100 : 1900}
                  className="relative font-poppins text-[32px] font-bold tabular-nums text-ink transition-transform duration-500 group-hover:scale-105 lg:text-5xl"
                />
                <p className="relative text-center font-poppins text-xs font-bold uppercase tracking-wide text-muted transition-colors duration-500 group-hover:text-ink">
                  {label}
                </p>
              </div>
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------- academic programs */}
      <section className="relative overflow-hidden bg-white py-14 lg:py-20">
        <DoodleLayer />
        <div className="shell relative flex flex-col gap-10 lg:gap-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="eyebrow">Academic Programs</p>
            <Link to="/academics" className="btn btn-outline">
              View Curriculum
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {PROGRAMS.map(({ icon, title, text, to }, i) => {
              const Icon = ICONS[icon] ?? IconFlask;
              return (
              <Reveal key={title} className="h-full" style={{ transitionDelay: `${i * 90}ms` }}>
                {/* the whole card is the link; hover lives here, not on
                    the .reveal wrapper whose transition would cancel it */}
                <Link
                  to={to}
                  onMouseMove={spotlight}
                  className="group relative flex h-full flex-col items-start gap-3 overflow-hidden rounded-[20px] border border-line bg-white p-6 shadow-[0_12px_24px_-10px_rgba(38,65,48,0.16)] outline-none transition-[translate,box-shadow,border-color] duration-500 ease-out hover:-translate-y-2 hover:border-ink/15 hover:shadow-[0_30px_50px_-22px_rgba(38,65,48,0.45)] focus-visible:-translate-y-2 focus-visible:border-ink/15 lg:p-8"
                >
                  {/* corner circle grows into a soft green wash */}
                  <span className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-tint transition-transform duration-700 ease-out group-hover:scale-[4] group-focus-visible:scale-[4]" />
                  {/* spotlight that follows the cursor */}
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),rgba(38,65,48,0.08),transparent_65%)] group-hover:opacity-100" />

                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-tint text-ink ring-0 ring-ink/10 transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-ink group-hover:text-white group-hover:ring-[7px] group-focus-visible:bg-ink group-focus-visible:text-white group-focus-visible:ring-[7px]">
                    <Icon size={22} />
                  </span>
                  <h3 className="relative font-poppins text-[22px] font-bold">{title}</h3>
                  <p className="relative font-poppins text-sm text-body">{text}</p>
                  <span className="relative mt-auto inline-flex items-center gap-2 pt-2 font-poppins text-sm font-bold text-ink">
                    Learn more
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent transition-all duration-500 group-hover:translate-x-1.5 group-hover:bg-ink group-hover:text-white">
                      <IconArrowRight size={16} />
                    </span>
                  </span>
                </Link>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="relative overflow-hidden bg-white py-14 lg:py-20">
        <DoodleLayer />
        <div className="shell relative">
          <Reveal>
            {/* hover lives on this inner card: .reveal owns the outer
                element's transition, which would cancel the lift */}
            <div
              onMouseMove={spotlight}
              className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-line bg-white px-6 py-10 text-center shadow-[0_12px_24px_-10px_rgba(38,65,48,0.14)] transition-[translate,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-ink/15 hover:shadow-[0_36px_60px_-28px_rgba(38,65,48,0.45)] sm:px-10 lg:px-14 lg:py-14"
            >
              {/* two corner circles grow into a soft green wash */}
              <span className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-tint transition-transform duration-700 ease-out group-hover:scale-[3]" />
              <span className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-tint transition-transform duration-700 ease-out group-hover:scale-[3]" />
              {/* spotlight that follows the cursor */}
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(380px_circle_at_var(--mx,50%)_var(--my,50%),rgba(38,65,48,0.08),transparent_65%)] group-hover:opacity-100" />

              <p className="eyebrow relative">{cta.eyebrow}</p>
              <div className="relative flex flex-col items-center gap-3">
                <h2 className="font-poppins text-[28px] font-bold leading-[1.1] sm:text-[36px] lg:text-[44px]">
                  {cta.title}
                </h2>
                <p className="max-w-[640px] font-poppins text-base text-body lg:text-lg">
                  {cta.body}
                </p>
              </div>
              <div className="relative flex flex-wrap items-center justify-center gap-5">
                <Link to="/admissions#registration" className="group/btn btn btn-primary h-16 px-8">
                  Enquire Now
                  <span className="transition-transform duration-300 group-hover/btn:translate-x-1.5">
                    <IconArrowRight />
                  </span>
                </Link>
                <a
                  href={brochure}
                  download
                  className="group/btn btn btn-outline h-16 px-8 hover:border-ink hover:bg-ink hover:text-white"
                >
                  Download Brochure
                  <span className="transition-transform duration-300 group-hover/btn:translate-x-1.5">
                    <IconArrowRight />
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
