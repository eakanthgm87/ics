import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, SectionTitle } from "../components/common";
import { useContent } from "../api";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconGlobe,
  IconShield,
} from "../components/Icons";

/* The school does not publish individual staff names or photographs, so these
   cards describe its teaching departments rather than naming people. Swap in
   real names, roles and portraits when the school supplies them. */
const FALLBACK_FACULTY = [
  {
    name: "Science Faculty",
    role: "Physics · Chemistry · Biology",
    dept: "Middle & High School",
    qual: "Three dedicated laboratories",
    bio: "Laboratories equipped with the apparatus, instruments and materials needed to run practical work across all three science streams.",
    img: "/images/faculty-3.svg",
  },
  {
    name: "Mathematics Faculty",
    role: "Numeracy & Problem Solving",
    dept: "Nursery to Grade 10",
    qual: "KSEEB syllabus",
    bio: "Builds numeracy from early play-based counting through to board-level problem solving, including Vedic mathematics in the library collection.",
    img: "/images/faculty-5.svg",
  },
  {
    name: "Languages Faculty",
    role: "English · Hindi · Kannada",
    dept: "Nursery to Grade 10",
    qual: "English medium of instruction",
    bio: "Literature in all three languages is stocked in the school library to encourage independent reading and a lifelong passion for books.",
    img: "/images/faculty-1.svg",
  },
  {
    name: "Computer Faculty",
    role: "Digital Literacy",
    dept: "Computer Laboratory",
    qual: "Licensed software throughout",
    bio: "Students get hands-on lab access three times a week, working with educational and office application software on desktop machines.",
    img: "/images/faculty-2.svg",
  },
  {
    name: "Physical Education",
    role: "Sports & Games",
    dept: "All grades",
    qual: "Host of the annual Swift meet",
    bio: "Cricket, kho kho, badminton, chess, kabaddi, throwball and volleyball, culminating in the inter-class and inter-house Swift competitions.",
    img: "/images/faculty-4.svg",
  },
];

const FALLBACK_AWARDS = [
  {
    year: "2024-25",
    title: "Swift Awards",
    body: "Annual inter-house and inter-class sports meet",
    img: "/images/award-4.svg",
  },
  {
    year: "2023-24",
    title: "JB Nagar Cluster Sports",
    body: "Inter-school cluster competitions",
    img: "/images/award-1.svg",
  },
  {
    year: "2019-20",
    title: "Healthy School Award",
    body: "Recognised for student health and wellbeing",
    img: "/images/award-2.svg",
  },
  {
    year: "2017-18",
    title: "JB Nagar Cluster Sports",
    body: "Inter-school cluster competitions",
    img: "/images/award-3.svg",
  },
  {
    year: "2016-17",
    title: "JB Nagar Cluster Sports",
    body: "Inter-school cluster competitions",
    img: "/images/award-1.svg",
  },
  {
    year: "2012-13",
    title: "JB Nagar Cluster Sports",
    body: "Inter-school cluster competitions",
    img: "/images/award-3.svg",
  },
];

/* ------------------------------------------------------- faculty carousel --
   Every card is the same size and every portrait is the same size, so the
   row never changes height. A card expands only when it is clicked (or
   reached with the arrows / dots) — nothing moves on its own. The row is a
   fixed height so revealing a bio cannot push the rest of the page around.
--------------------------------------------------------------------------- */
function FacultyCarousel() {
  const FACULTY = useContent("/people/", FALLBACK_FACULTY);
  const [index, setIndex] = useState(2);
  const total = FACULTY.length;

  const go = useCallback(
    (dir) => setIndex((i) => (i + dir + total) % total),
    [total]
  );

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* fixed height: the tallest (expanded) card fits, so nothing below
          this row ever shifts when a card opens or closes */}
      <div
        role="group"
        aria-label="Faculty profiles"
        onKeyDown={onKeyDown}
        className="flex h-[430px] w-full items-center justify-center gap-5 px-4 sm:h-[470px] sm:gap-7"
      >
        {FACULTY.map((f, i) => {
          const offset = (i - index + total) % total;
          const pos = offset > total / 2 ? offset - total : offset; // -2..2
          const open = pos === 0;
          const dist = Math.abs(pos);

          return (
            <button
              type="button"
              key={f.name}
              onClick={() => setIndex(i)}
              aria-expanded={open}
              aria-label={open ? undefined : `Show ${f.name}`}
              style={{ order: pos + 2 }}
              className={[
                "relative flex w-[250px] shrink-0 flex-col items-start overflow-hidden rounded-2xl border border-line bg-white text-left sm:w-[270px]",
                "transition-[opacity,transform,box-shadow] duration-500 ease-out",
                open
                  ? "z-10 scale-[1.06] shadow-[0_30px_18px_-8px_rgba(38,65,48,0.18)]"
                  : "shadow-[0_13px_10px_-7px_rgba(38,65,48,0.18)]",
                dist === 2 ? "opacity-40" : "opacity-100",
                // narrower screens simply show fewer of them
                dist === 0 ? "" : dist === 1 ? "hidden md:flex" : "hidden xl:flex",
              ].join(" ")}
            >
              {open ? (
                <span className="absolute -top-3 left-6 flex h-7 items-center rounded-full bg-ink px-3 font-poppins text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  Featured
                </span>
              ) : null}

              {/* the portrait grows to fill the card and fades back, so the
                  text reads over it — the card box itself never changes size */}
              <img
                src={f.img}
                alt={f.name}
                loading="lazy"
                className={[
                  "absolute left-0 top-0 w-full object-cover transition-all duration-500 ease-out",
                  open ? "h-full opacity-30" : "h-[190px] opacity-100",
                ].join(" ")}
              />
              {/* reserves the collapsed portrait's space */}
              <span className="h-[190px] w-full shrink-0" aria-hidden="true" />

              <span
                className={[
                  "relative flex w-full flex-col gap-1.5 p-5 transition-colors duration-500",
                  open ? "bg-transparent" : "bg-white",
                ].join(" ")}
              >
                <span className="font-poppins text-base font-bold text-ink">
                  {f.name}
                </span>
                <span className="font-poppins text-sm font-bold text-ink">
                  {f.role}
                </span>
                <span className="subhead text-[13px] text-muted">{f.dept}</span>

                <span className="flex items-center gap-2 pt-1.5">
                  {open ? (
                    <span className="h-0.5 w-5 shrink-0 rounded bg-ink" />
                  ) : null}
                  <span className="font-arsenal text-[13px] text-body">
                    {f.qual}
                  </span>
                </span>

                {/* only the clicked card reveals the bio */}
                <span
                  className={[
                    "grid transition-all duration-500 ease-out",
                    open ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  ].join(" ")}
                >
                  <span className="overflow-hidden">
                    <span className="block border-t border-line pt-3 font-arsenal text-[13px] leading-[1.6] text-body">
                      {f.bio}
                    </span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous faculty member"
          className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-ink bg-white text-ink transition-colors hover:bg-tint"
        >
          <IconChevronLeft />
        </button>
        <div className="flex items-center gap-2.5">
          {FACULTY.map((f, i) => (
            <button
              key={f.name}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${f.name}`}
              aria-current={i === index}
              className={[
                "rounded-full transition-all duration-300",
                i === index ? "h-2.5 w-2.5 bg-ink" : "h-2 w-2 bg-ink/25 hover:bg-ink/50",
              ].join(" ")}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next faculty member"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-[#1b3123]"
        >
          <IconChevronRight />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- awards carousel */
function AwardsCarousel() {
  const AWARDS = useContent("/awards/", FALLBACK_AWARDS);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(4);

  useEffect(() => {
    const set = () => {
      const w = window.innerWidth;
      setPerPage(w >= 1200 ? 4 : w >= 900 ? 3 : w >= 640 ? 2 : 1);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  const pages = Math.max(1, Math.ceil(AWARDS.length / perPage));
  const current = Math.min(page, pages - 1);
  const shown = AWARDS.slice(current * perPage, current * perPage + perPage);

  return (
    <div className="flex w-full flex-col gap-10">
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
      >
        {shown.map((a) => (
          <article
            key={a.title + a.year}
            /* every card carries the same border — no highlighted variant */
            className="flex h-[440px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_28px_-14px_rgba(38,65,48,0.2)] transition-transform duration-300 hover:-translate-y-1"
          >
            <img
              src={a.img}
              alt=""
              aria-hidden="true"
              className="h-[200px] w-full shrink-0 object-cover"
              loading="lazy"
            />
            <div className="flex flex-1 flex-col items-start gap-3 p-6">
              <span className="rounded-full bg-tint px-3 py-1 font-poppins text-xs font-bold text-brand">
                {a.year}
              </span>
              <h3 className="font-poppins text-lg font-bold leading-snug">
                {a.title}
              </h3>
              <p className="subhead text-sm text-body">{a.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((p) => (p - 1 + pages) % pages)}
          aria-label="Previous awards"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink shadow-[0_4px_12px_-4px_rgba(38,65,48,0.2)] transition-colors hover:bg-tint"
        >
          <IconArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Awards page ${i + 1}`}
              aria-current={i === current}
              className={[
                "rounded-full transition-all duration-300",
                i === current ? "h-2.5 w-2.5 bg-ink" : "h-2 w-2 bg-ink/25 hover:bg-ink/50",
              ].join(" ")}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPage((p) => (p + 1) % pages)}
          aria-label="Next awards"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-[0_4px_12px_-4px_rgba(38,65,48,0.3)] transition-colors hover:bg-[#1b3123]"
        >
          <IconArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- page */
export default function About() {
  return (
    <>
      {/* ------------------------------------------------- about the school
          Copy on the left, framed photograph on the right. The "1979"
          watermark sits behind the heading, its left edge flush with the
          eyebrow, heading and body below it. */}
      <section className="overflow-hidden bg-white py-12 lg:py-20">
        <div className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-20">
          <div className="relative flex flex-col items-start gap-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 left-0 select-none font-poppins text-[130px] font-bold leading-[0.78] tracking-tight text-black/[0.045] sm:text-[200px] lg:-top-20 lg:text-[280px]"
            >
              1979
            </span>

            <div className="relative flex flex-col items-start gap-4">
              <p className="eyebrow text-ink">Established</p>
              <h1 className="font-poppins text-[36px] font-bold leading-[1.1] sm:text-[48px] lg:text-[56px]">
                About the school
              </h1>
              <p className="max-w-[620px] font-arsenal text-base leading-[1.7] text-body">
                Established in 1979 in the lush surroundings of HAL 3rd Stage,
                Bengaluru, the Indiranagar Cambridge School has stood as a beacon
                of progressive learning for over four decades. What began with just
                7 students and 2 teachers in a modest rented space in Thippasandra
                has matured into a trusted co-educational institution nurturing
                well-rounded learners.
              </p>
            </div>
            <Link to="/founder-story" className="relative btn btn-dark">
              Read Our History
            </Link>
          </div>

          <div className="framed w-full">
            <img
              src="/images/about-hero.svg"
              alt="The ICS campus courtyard"
              className="h-[340px] w-full rounded-2xl object-cover sm:h-[460px]"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ the founder */}
      <section className="bg-white py-12 lg:py-20">
        <div className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:gap-20">
          <Reveal className="relative w-full">
            <img
              src="/images/founder.svg"
              alt="Late Mrs. Kasturi Shoury, founder"
              className="h-[380px] w-full rounded-2xl object-cover sm:h-[520px]"
            />
            <span className="absolute -right-4 top-8 flex h-20 w-20 items-center justify-center rounded-full bg-ink p-1 shadow-[0_8px_20px_-8px_rgba(38,65,48,0.5)]">
              <span className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-white font-poppins text-[10px] font-bold uppercase tracking-wider text-white">
                Founder
              </span>
            </span>
          </Reveal>

          <div className="flex flex-col items-start gap-3">
            <p className="font-poppins text-[26px] font-bold uppercase leading-tight text-muted lg:text-[34px]">
              Late Mrs. Kasturi Shoury (b. 1950)
            </p>
            <h2 className="font-poppins text-[28px] font-bold lg:text-[36px]">
              About the founder
            </h2>
            <p className="mt-2 font-arsenal text-base leading-[1.7] text-body">
              In 1979, Mrs. Kasturi Shoury set out to create a school that offered
              quality English-medium education to the lower middle class. Starting
              with just seven curious students in a modest rented space in
              Thippasandra, her vision blended rigorous academics with the values of
              compassion and continuous self-improvement.
            </p>
            <p className="mt-3 font-arsenal text-base leading-[1.7] text-body">
              &quot;We do not educate for examinations; we educate for life,&quot;
              she believed. Under her stewardship, the school moved to its current
              premises in 1986 and produced its first Class X batch in 1989 —
              embedding life skills, meditation, and holistic development into the
              heart of the campus.
            </p>
            <blockquote className="mt-3 border-l-[3px] border-ink pl-4 subhead text-lg text-ink">
              &quot;Nurture the root, and the branches will reach the skies.&quot;
            </blockquote>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- the principal
          Mirror of the founder row: copy left, portrait right. */}
      <section className="bg-white py-12 lg:py-20">
        <div className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-20">
          <div className="flex flex-col items-start gap-3">
            <p className="font-poppins text-[26px] font-bold uppercase leading-tight text-muted lg:text-[34px]">
              Mrs. Shanthi Ravichandran
            </p>
            <h2 className="font-poppins text-[28px] font-bold lg:text-[36px]">
              About the Principal
            </h2>
            <p className="subhead text-lg text-ink">
              Director of Academics &middot; M.Phil, MA, B.Ed
            </p>
            <p className="mt-3 font-arsenal text-base leading-[1.7] text-body">
              Mrs. Shanthi Ravichandran leads academics at Indiranagar Cambridge
              School, guiding the teaching team across Nursery to Grade 10 under
              the Karnataka State Education Board. Her focus is a classroom where
              every child is supported to reach their own personal best.
            </p>
            <blockquote className="mt-4 subhead text-lg leading-[1.6] text-ink">
              &quot;Teachers are our greatest strength.&quot;
            </blockquote>
          </div>

          <Reveal className="w-full">
            <img
              src="/images/principal.svg"
              alt="Mrs. Shanthi Ravichandran, Director of Academics"
              className="h-[380px] w-full rounded-2xl object-cover sm:h-[520px]"
            />
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- our people */}
      <section className="overflow-hidden bg-white py-12 lg:py-20">
        <div className="shell">
          <SectionTitle title="Our People" align="left" />
        </div>
        <div className="mt-10">
          <FacultyCarousel />
        </div>
      </section>

      {/* -------------------------------------------------- vision & mission */}
      <section className="bg-white py-12 lg:py-20">
        <div className="shell flex flex-col items-center gap-10 lg:gap-16">
          <SectionTitle title="Our Vision & Mission" />
          <div className="grid w-full gap-8 lg:grid-cols-2 lg:gap-[60px]">
            <Reveal className="flex flex-col items-start gap-6 rounded-2xl border border-line bg-tint p-8 lg:p-12">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink">
                <IconGlobe size={26} />
              </span>
              <div className="flex w-full flex-col gap-3">
                <h3 className="font-poppins text-2xl font-bold">Our Vision</h3>
                <span className="h-px w-full bg-ink/10" />
              </div>
              <p className="font-arsenal text-base leading-[1.7] text-body">
                To create a compassionate, inclusive school environment where
                every child is seen, valued, and supported.
              </p>
            </Reveal>

            <Reveal
              className="flex flex-col items-start gap-6 rounded-2xl border border-line bg-tint p-8 lg:p-12"
              style={{ transitionDelay: "110ms" }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand">
                <IconShield size={26} />
              </span>
              <div className="flex w-full flex-col gap-3">
                <h3 className="font-poppins text-2xl font-bold">Our Mission</h3>
                <span className="h-px w-full bg-ink/10" />
              </div>
              <p className="font-arsenal text-base leading-[1.7] text-body">
                To foster a love of learning, ensuring that each student —
                regardless of their financial background or academic ability — is
                empowered to grow, thrive, and achieve their personal best.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ awards */}
      <section id="awards" className="scroll-mt-24 bg-white py-12 lg:py-20">
        <div className="shell flex flex-col items-center gap-10 lg:gap-14">
          <SectionTitle title="Awards & Honors" />
          <AwardsCarousel />
        </div>
      </section>
    </>
  );
}
