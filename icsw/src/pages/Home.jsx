import { Link } from "react-router-dom";
import { CountUp, DoodleLayer, HeroBanner, Reveal } from "../components/common";
import { useBrochure, useContent } from "../api";
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
const STAT_ICONS = {
  calendar: IconCalendar,
  users: IconUsers,
  award: IconAward,
  pin: IconPin,
  flask: IconFlask,
  palette: IconPalette,
};

/* `from` lets the founding year count down from the present day while the
   rest of the tiles count up from zero. */
/* Only figures the school itself publishes. Student/staff counts are not
   published anywhere, so they are deliberately absent. */
const FALLBACK_STATS = [
  { icon: IconCalendar, to: 1979, from: 2026, grouped: false, label: "Founded" },
  { icon: IconUsers, to: 7, label: "Students in 1979" },
  { icon: IconAward, to: 10, label: "Grades: Nursery to 10" },
  { icon: IconPin, to: 1989, grouped: false, label: "First Class X Batch" },
];

const PROGRAMS = [
  {
    icon: IconFlask,
    title: "STEM Excellence",
    text: "Hands-on science, tech, engineering, and math - designed to spark wonder and real-world problem-solving.",
    to: "/academics",
  },
  {
    icon: IconPalette,
    title: "Arts & Creativity",
    text: "Music, art, drama, and imagination - nurturing self-expression and creative confidence.",
    to: "/life-at-ics",
  },
];

export default function Home() {
  const STATS = useContent("/stats/", FALLBACK_STATS);
  const brochure = useBrochure();

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="bg-white py-10 lg:py-20">
        <div className="shell">
          <HeroBanner
            image="/images/hero-campus.svg"
            badge="Admissions open 2025–26"
            seal
            title="Nurturing Minds Since 1979"
            text="Welcome to Indiranagar Cambridge School — a co-educational institution offering Nursery through Grade 10 under the Karnataka State Education Board, where academic excellence meets holistic development."
          >
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Link to="/admissions#registration" className="btn btn-primary">
                Enquire Now
                <IconArrowRight />
              </Link>
              <a
                href={brochure}
                download
                className="btn bg-white px-7 py-3.5 text-ink hover:bg-tint"
              >
                Download Brochure
              </a>
            </div>
          </HeroBanner>
        </div>
      </section>

      {/* ----------------------------------------------------------- stats */}
      <section className="bg-white pb-12 lg:pb-20">
        <div className="shell grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
          {STATS.map(({ icon, to, from, suffix, grouped, label }, i) => {
            const Icon = STAT_ICONS[icon] ?? IconAward;
            return (
            <Reveal
              key={label}
              className="card relative flex flex-col items-center gap-4 overflow-hidden px-6 py-8"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <span className="absolute inset-x-0 top-0 h-1.5 bg-ink" />
              <span className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-tint" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-ink">
                <Icon size={24} />
              </span>
              <CountUp
                to={to}
                from={from}
                suffix={suffix}
                grouped={grouped}
                duration={1900}
                className="relative font-poppins text-[32px] font-bold tabular-nums text-ink lg:text-5xl"
              />
              <p className="relative font-poppins text-xs font-bold uppercase tracking-wide text-muted">
                {label}
              </p>
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
            {PROGRAMS.map(({ icon: Icon, title, text, to }, i) => (
              <Reveal
                key={title}
                className="flex h-full flex-col items-start gap-3 rounded-[20px] border border-line bg-white p-6 shadow-[0_12px_24px_-10px_rgba(38,65,48,0.16)] transition-transform duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tint text-ink">
                  <Icon size={22} />
                </span>
                <h3 className="font-poppins text-[22px] font-bold">{title}</h3>
                <p className="font-arsenal text-sm text-body">{text}</p>
                <Link
                  to={to}
                  className="mt-auto inline-flex items-center gap-2 pt-2 font-poppins text-sm font-bold text-ink transition-colors hover:text-brand"
                >
                  Learn more
                  <IconArrowRight size={16} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="relative overflow-hidden bg-white py-14 lg:py-20">
        <DoodleLayer />
        <div className="shell relative">
          <Reveal className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-white px-6 py-10 text-center shadow-[0_12px_24px_-10px_rgba(38,65,48,0.14)] sm:px-10 lg:px-14 lg:py-14">
            <p className="eyebrow">Indiranagar Cambridge School</p>
            <div className="flex flex-col items-center gap-3">
              <h2 className="font-poppins text-[28px] font-bold leading-[1.1] sm:text-[36px] lg:text-[44px]">
                Ready to Begin Your Child&apos;s Journey?
              </h2>
              <p className="max-w-[640px] font-arsenal text-base text-body lg:text-lg">
                Join the ICS family - where every student is inspired to learn,
                grow, and lead.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link to="/admissions#registration" className="btn btn-primary h-16 px-8">
                Enquire Now
                <IconArrowRight />
              </Link>
              <a href={brochure} download className="btn btn-outline h-16 px-8">
                Download Brochure
                <IconArrowRight />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
