import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SectionTitle, useSwipe } from "../components/common";
import { paragraphs, useContent, useSection } from "../api";
import CONTENT from "../data/content.json";
import {
  IconArrowLeft,
  IconArrowRight,
  IconAward,
  IconClose,
  IconGlobe,
  IconShield,
} from "../components/Icons";

/* -------------------------------------------------------- profile popup --
   Opened by clicking a faculty card. A dark, blurred backdrop; the portrait
   on one side and the full profile on the other. Escape / the close button /
   a backdrop click dismiss it, and ← → (or the arrows) step through staff. */
function PersonModal({ people, index, onIndex, onClose }) {
  const person = people[index];
  const total = people.length;
  const at = (dir) => (index + dir + total) % total;
  // swipe left for the next person, right for the previous one
  const swipe = useSwipe(() => onIndex(at(1)), () => onIndex(at(-1)));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % total);
      if (e.key === "ArrowLeft") onIndex((index - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, total, onIndex, onClose]);

  const facts = [
    ["Qualifications", person.qual],
    ["Experience", person.exp],
    ["Department", person.dept],
  ].filter(([, v]) => v);
  const [lead, ...rest] = paragraphs(person.bio);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={person.name}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1510]/75 p-3 backdrop-blur-2xl backdrop-saturate-150 sm:p-6 motion-safe:animate-[lb-fade_.3s_ease-out]"
    >
      <div
        key={index /* replay the entrance when stepping between people */}
        onClick={(e) => e.stopPropagation()}
        {...swipe}
        // one fixed size for everyone: a longer bio scrolls inside instead
        className="relative grid h-[88vh] max-h-[720px] w-full max-w-[1040px] md:h-[600px] md:max-h-[90vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[28px] bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:grid-rows-1 motion-safe:animate-[lb-pop_.4s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* ------------------------------------------------ portrait side */}
        <div className="relative h-[240px] overflow-hidden bg-ink sm:h-[320px] md:h-full">
          <img
            src={person.img}
            alt={person.name}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1510]/85 via-transparent to-transparent" />
          <span className="absolute left-5 top-5 rounded-full bg-black/25 px-3 py-1.5 font-poppins text-[10px] font-bold uppercase tracking-[0.16em] text-white ring-1 ring-white/25 backdrop-blur-md">
            Our Faculty
          </span>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-6">
            <span className="h-[3px] w-12 rounded-full bg-brand" />
            <span className="font-poppins text-sm font-bold tracking-widest text-white">
              {pad(index + 1)}
              <span className="text-white/50"> / {pad(total)}</span>
            </span>
          </div>
        </div>

        {/* ------------------------------------------------- profile side */}
        <div className="flex min-h-0 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-7 sm:px-10 sm:pt-10">
            <div className="flex flex-col gap-2 pr-12">
              <p className="font-poppins text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {person.role}
              </p>
              <h2 className="font-poppins text-[26px] font-bold leading-[1.15] sm:text-[34px]">
                {person.name}
              </h2>
            </div>

            {facts.length ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {facts.map(([k, v]) => (
                  <div
                    key={k}
                    className={[
                      "flex flex-col gap-1 rounded-2xl border border-line bg-tint px-4 py-3",
                      k === "Qualifications" ? "sm:col-span-2" : "",
                    ].join(" ")}
                  >
                    <dt className="font-poppins text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                      {k}
                    </dt>
                    <dd className="font-poppins text-sm font-bold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {lead ? (
              <div className="flex flex-col gap-3">
                <p className="copy-justify border-l-[3px] border-brand pl-4 font-arsenal text-[17px] leading-[1.65] text-ink">
                  {lead}
                </p>
                {rest.map((t) => (
                  <p key={t} className="copy-justify font-arsenal text-[15px] leading-[1.75] text-body">
                    {t}
                  </p>
                ))}
              </div>
            ) : null}
          </div>

          {/* step through the team without closing */}
          <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4 sm:px-10">
            <button
              type="button"
              onClick={() => onIndex(at(-1))}
              className="flex min-w-0 items-center gap-2 font-poppins text-xs font-bold text-ink transition-colors hover:text-brand"
            >
              <IconArrowLeft size={16} />
              <span className="truncate">{people[at(-1)].name}</span>
            </button>
            <button
              type="button"
              onClick={() => onIndex(at(1))}
              className="flex min-w-0 items-center gap-2 font-poppins text-xs font-bold text-ink transition-colors hover:text-brand"
            >
              <span className="truncate">{people[at(1)].name}</span>
              <IconArrowRight size={16} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-[0_6px_20px_-6px_rgba(0,0,0,0.4)] ring-1 ring-black/5 transition-transform duration-300 hover:rotate-90"
        >
          <IconClose size={20} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ faculty marquee --
   The cards scroll sideways in an endless loop at one constant speed (the
   list is rendered twice and the track wraps after exactly one copy). It can
   also be dragged / swiped either way, then carries on by itself. Every card
   is one fixed size — a portrait with the name and role laid over it — so a
   long name can never make one card taller than the rest. Hovering or
   focusing pauses the loop; clicking (not dragging) opens the full profile. */
const LOOP_SPEED = 56; // px per second — the same pace as before

function useDragLoop() {
  const track = useRef(null);
  const s = useRef({ x: 0, paused: false, drag: null, moved: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const st = s.current;
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (!st.paused && !st.drag && !still) st.x -= LOOP_SPEED * dt;
      const half = el.scrollWidth / 2;
      if (half) st.x = ((st.x % half) - half) % half; // keep within one copy
      el.style.transform = `translate3d(${st.x}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const st = s.current;
  const wrapper = {
    onMouseEnter: () => (st.paused = true),
    onMouseLeave: () => (st.paused = false),
    onFocus: () => (st.paused = true),
    onBlur: () => (st.paused = false),
    onPointerDown: (e) => {
      st.drag = { from: e.clientX, x: st.x, id: e.pointerId };
      st.moved = false;
    },
    onPointerMove: (e) => {
      if (!st.drag) return;
      const dx = e.clientX - st.drag.from;
      if (!st.moved && Math.abs(dx) > 6) {
        st.moved = true;
        e.currentTarget.setPointerCapture(st.drag.id);
      }
      if (st.moved) st.x = st.drag.x + dx;
    },
    onPointerUp: () => (st.drag = null),
    onPointerCancel: () => (st.drag = null),
    // a drag must not count as a click on the card under the pointer
    onClickCapture: (e) => {
      if (st.moved) {
        e.preventDefault();
        e.stopPropagation();
        st.moved = false;
      }
    },
  };
  return { track, wrapper };
}

function FacultyLoop() {
  const PEOPLE = useContent("/people/", CONTENT.people);
  const [open, setOpen] = useState(null);
  const { track, wrapper } = useDragLoop();

  const card = (p, i, copy) => (
    <li key={`${copy}-${i}`} className="shrink-0 pr-6" aria-hidden={copy ? true : undefined}>
      <button
        type="button"
        tabIndex={copy ? -1 : undefined}
        onClick={() => setOpen(i)}
        aria-label={`View profile of ${p.name}`}
        className="group relative block h-[340px] w-[256px] overflow-hidden rounded-[22px] bg-ink text-left shadow-[0_18px_30px_-16px_rgba(38,65,48,0.45)] ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-[0_28px_40px_-16px_rgba(38,65,48,0.6)]"
      >
        <img
          src={p.img}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#0b1510]/90 via-[#0b1510]/20 via-45% to-transparent" />
        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
          <span className="mb-1.5 h-[3px] w-8 rounded-full bg-brand transition-all duration-300 group-hover:w-14" />
          <span className="line-clamp-2 font-poppins text-[17px] font-bold leading-snug text-white">
            {p.name}
          </span>
          <span className="line-clamp-1 font-poppins text-[12px] text-white/75">{p.role}</span>
          <span className="mt-2 inline-flex items-center gap-1.5 font-poppins text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
            View profile
            <IconArrowRight size={14} />
          </span>
        </span>
      </button>
    </li>
  );

  return (
    <>
      <div
        {...wrapper}
        // vertical page scrolling stays native; sideways drags move the strip
        className="cursor-grab touch-pan-y select-none overflow-hidden py-6 active:cursor-grabbing"
      >
        <ul ref={track} className="flex w-max will-change-transform">
          {PEOPLE.map((p, i) => card(p, i, 0))}
          {PEOPLE.map((p, i) => card(p, i, 1))}
        </ul>
      </div>
      {open !== null ? (
        <PersonModal
          people={PEOPLE}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}

/* -------------------------------------------------------- awards carousel */
function AwardsCarousel() {
  const AWARDS = useContent("/awards/", CONTENT.awards);
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
            className="group flex h-[370px] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[0_12px_28px_-14px_rgba(38,65,48,0.2)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_48px_-20px_rgba(38,65,48,0.4)]"
          >
            {/* plaques, trophies and certificates come in every shape: each
                sits whole and centred in an identical frame, over a blurred,
                enlarged copy of itself so no frame ever looks empty */}
            <div className="relative h-[220px] shrink-0 overflow-hidden bg-ink">
              <img
                src={a.img}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl"
                loading="lazy"
              />
              <span className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
              <img
                src={a.img}
                alt={a.title}
                className="relative h-full w-full object-contain p-5 drop-shadow-[0_14px_20px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                loading="lazy"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-poppins text-xs font-bold text-brand shadow-sm backdrop-blur">
                {a.year}
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-start gap-2 px-5 py-4">
              <span className="h-[3px] w-8 rounded-full bg-brand transition-all duration-500 group-hover:w-14" />
              <h3 className="line-clamp-2 font-poppins text-base font-bold leading-snug">
                {a.title}
              </h3>
              <p className="line-clamp-3 subhead text-[13px] leading-relaxed text-body">{a.body}</p>
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

/* intro paragraphs + bold tagline, used above the faculty and awards rows */
function Intro({ section }) {
  return (
    <div className="flex max-w-[860px] flex-col items-center gap-4 text-center">
      {paragraphs(section.body).map((p) => (
        <p key={p} className="font-arsenal text-base leading-[1.7] text-body">
          {p}
        </p>
      ))}
      {section.subtitle ? (
        <p className="font-poppins text-base font-bold text-ink">{section.subtitle}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------- page */
export default function About() {
  const school = useSection("about-school");
  const founder = useSection("about-founder");
  const principal = useSection("about-principal");
  const people = useSection("about-people");
  const awards = useSection("about-awards");
  const values = [
    { s: useSection("about-vision"), Icon: IconGlobe },
    { s: useSection("about-mission"), Icon: IconShield },
    { s: useSection("about-motto"), Icon: IconAward },
  ];

  return (
    <>
      {/* ------------------------------------------------- about the school
          Copy on the left, framed photograph on the right. The "1979"
          watermark sits behind the heading, its left edge flush with the
          eyebrow, heading and body below it. */}
      <section className="overflow-hidden bg-white py-12 lg:py-20">
        <div className="shell grid items-center gap-12 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-20">
          <div className="relative flex flex-col items-start gap-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 left-0 select-none font-poppins text-[130px] font-bold leading-[0.78] tracking-tight text-black/[0.1] sm:text-[200px] lg:-top-20 lg:text-[280px]"
            >
              1979
            </span>

            <div className="relative flex flex-col items-start gap-4">
              <p className="eyebrow text-ink">{school.eyebrow}</p>
              <h1 className="font-poppins text-[32px] font-bold leading-[1.1] sm:text-[44px] lg:text-[40px] xl:text-[56px]">
                {school.title}
              </h1>
              {paragraphs(school.body).map((p) => (
                <p key={p} className="copy-justify max-w-[620px] font-arsenal text-base leading-[1.7] text-body">
                  {p}
                </p>
              ))}
            </div>
            <Link to="/founder-story" className="relative btn btn-dark">
              Read Our History
            </Link>
          </div>

          <div className="framed w-full">
            <img
              src={school.img}
              alt="The Indiranagar Cambridge School campus"
              className="h-[340px] w-full rounded-2xl object-cover sm:h-[460px]"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ the founder */}
      <section className="bg-white py-12 lg:py-20">
        <div className="shell grid items-start gap-12 lg:grid-cols-2 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:gap-20">
          <div className="relative w-full lg:sticky lg:top-28">
            <img
              src={founder.img}
              alt={founder.eyebrow}
              className="h-[380px] w-full rounded-2xl object-cover sm:h-[520px]"
            />
            <span className="absolute -right-4 top-8 flex h-20 w-20 items-center justify-center rounded-full bg-ink p-1 shadow-[0_8px_20px_-8px_rgba(38,65,48,0.5)]">
              <span className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-white font-poppins text-[10px] font-bold uppercase tracking-wider text-white">
                Founder
              </span>
            </span>
          </div>

          <div className="flex flex-col items-start gap-3">
            <p className="font-poppins text-[26px] font-bold uppercase leading-tight text-muted lg:text-[34px]">
              {founder.eyebrow}
            </p>
            <h2 className="font-poppins text-[28px] font-bold lg:text-[36px]">
              {founder.title}
            </h2>
            {paragraphs(founder.body).map((p) => (
              <p key={p} className="copy-justify mt-2 font-arsenal text-base leading-[1.7] text-body">
                {p}
              </p>
            ))}
            {founder.quote ? (
              <blockquote className="mt-3 border-l-[3px] border-ink pl-4 subhead text-lg text-ink">
                &quot;{founder.quote}&quot;
              </blockquote>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- the principal
          Mirror of the founder row: copy left, portrait right. */}
      <section className="bg-white py-12 lg:py-20">
        <div className="shell grid items-start gap-12 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-20">
          <div className="flex flex-col items-start gap-3">
            <p className="font-poppins text-[26px] font-bold uppercase leading-tight text-muted lg:text-[34px]">
              {principal.eyebrow}
            </p>
            <h2 className="font-poppins text-[28px] font-bold lg:text-[36px]">
              {principal.title}
            </h2>
            {principal.subtitle ? (
              <p className="subhead text-lg text-ink">{principal.subtitle}</p>
            ) : null}
            {paragraphs(principal.body).map((p) => (
              <p key={p} className="copy-justify mt-3 font-arsenal text-base leading-[1.7] text-body">
                {p}
              </p>
            ))}
            {principal.quote ? (
              <blockquote className="mt-4 subhead text-lg leading-[1.6] text-ink">
                &quot;{principal.quote}&quot;
              </blockquote>
            ) : null}
          </div>

          <img
            src={principal.img}
            alt={`${principal.eyebrow}, Principal`}
            className="h-[380px] w-full rounded-2xl object-cover object-top sm:h-[520px] lg:sticky lg:top-28"
          />
        </div>
      </section>

      {/* ------------------------------------------------------- our faculty */}
      <section className="overflow-hidden bg-white py-12 lg:py-20">
        <div className="shell flex flex-col items-center gap-6">
          <SectionTitle title={people.title} />
          <Intro section={people} />
        </div>
        <div className="mt-10">
          <FacultyLoop />
        </div>
      </section>

      {/* ------------------------------------------- vision, mission & motto */}
      <section className="bg-white py-12 lg:py-20">
        <div className="shell flex flex-col items-center gap-10 lg:gap-16">
          <SectionTitle title="Our Vision, Mission & Motto" />
          <div className="grid w-full gap-8 lg:grid-cols-3 lg:gap-10">
            {values.map(({ s, Icon }, i) => (
              <div
                key={s.title}
                tabIndex={0}
                className="group relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl border border-line bg-tint p-8 outline-none transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-2 hover:border-ink/20 hover:shadow-[0_34px_60px_-24px_rgba(38,65,48,0.55)] focus-visible:-translate-y-2 focus-visible:shadow-[0_34px_60px_-24px_rgba(38,65,48,0.55)] lg:p-10"
              >
                {/* oversized index numeral: faint at rest, solid green on hover */}
                <span className="pointer-events-none absolute right-5 top-3 origin-top-right font-poppins text-[96px] font-bold leading-none text-ink/[0.07] transition-all duration-500 group-hover:scale-110 group-hover:text-ink group-focus-visible:scale-110 group-focus-visible:text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ink shadow-[0_8px_20px_-10px_rgba(38,65,48,0.4)] transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-ink group-hover:text-white">
                  <Icon size={28} />
                </span>
                <div className="relative flex w-full flex-col gap-3">
                  <h3 className="font-poppins text-2xl font-bold">{s.title}</h3>
                </div>
                <p className="relative font-arsenal text-base leading-[1.7] text-body">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ awards */}
      <section id="awards" className="scroll-mt-24 bg-white py-12 lg:py-20">
        <div className="shell flex flex-col items-center gap-10 lg:gap-14">
          <div className="flex flex-col items-center gap-6">
            <SectionTitle title={awards.title} />
            <Intro section={awards} />
          </div>
          <AwardsCarousel />
        </div>
      </section>
    </>
  );
}
