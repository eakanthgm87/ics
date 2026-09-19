import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/** Jump to the top on navigation, or to the #hash target when one is present. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname, hash]);

  return null;
}

/** Fades a section in the first time it enters the viewport. */
export function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    // Already on screen (direct load, anchor jump, or no observer support)?
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    if (node.getBoundingClientRect().top < window.innerHeight) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.05 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={["reveal", shown ? "is-visible" : "", className].join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Counts from `from` to `to` once the element scrolls into view.
 * `from` defaults to 0, so a founding year can count *down* (2026 → 1979)
 * while the other tiles count up.
 * `grouped` adds thousands separators — turn it off for years.
 */
export function CountUp({
  to,
  from = 0,
  duration = 1800,
  suffix = "",
  grouped = true,
  className = "",
}) {
  const ref = useRef(null);
  const [value, setValue] = useState(from);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || run) return;
    if (typeof IntersectionObserver === "undefined") {
      setRun(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setRun(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [run]);

  useEffect(() => {
    if (!run) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(to);
      return;
    }

    let frame = 0;
    const start = performance.now();
    // ease-out cubic, so the number settles rather than stopping dead
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(from + (to - from) * ease(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {grouped ? value.toLocaleString("en-IN") : String(value)}
      {suffix}
    </span>
  );
}

/** Section heading block used on About / Academics / Life at ICS. */
export function SectionTitle({ eyebrow, title, align = "center", className = "" }) {
  return (
    <div
      className={[
        "flex w-full flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      ].join(" ")}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="font-poppins text-[28px] font-bold leading-tight sm:text-[32px] lg:text-4xl">
        {title}
      </h2>
    </div>
  );
}

const DOODLES = [
  {
    src: "doodle-books",
    cls: "left-[2%] top-5 hidden h-[90px] w-[90px] sm:block lg:h-[140px] lg:w-[140px]",
  },
  {
    src: "doodle-pencil",
    cls: "right-[4%] top-10 hidden h-20 w-20 sm:block lg:h-[120px] lg:w-[120px]",
  },
  { src: "doodle-gradcap", cls: "right-[5%] bottom-[10%] h-[85px] w-[85px] lg:h-[130px] lg:w-[130px]" },
  { src: "doodle-speechbubble", cls: "left-[4%] bottom-[6%] h-[70px] w-[70px] lg:h-[110px] lg:w-[110px]" },
  { src: "doodle-beaker", cls: "right-[10%] top-[46%] h-[70px] w-[70px] lg:h-[110px] lg:w-[110px]" },
  { src: "doodle-lightbulb", cls: "left-[8%] top-[48%] h-[70px] w-[70px] lg:h-[110px] lg:w-[110px]" },
  { src: "doodle-airplane", cls: "right-[22%] top-[8%] hidden h-[110px] w-[110px] lg:block" },
  { src: "doodle-sun", cls: "left-[24%] bottom-[8%] hidden h-[90px] w-[90px] lg:block" },
];

/** The hand-drawn doodle layer behind the academics / CTA bands. */
export function DoodleLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {DOODLES.map((d) => (
        <img
          key={d.src}
          src={`/images/${d.src}.svg`}
          alt=""
          className={`absolute opacity-50 ${d.cls}`}
          loading="lazy"
        />
      ))}
    </div>
  );
}

/**
 * The dashed-frame hero used on Home, Gallery, Life at ICS, Admissions
 * and Contact: background artwork with the copy laid over it.
 */
export function HeroBanner({
  image,
  badge,
  title,
  text,
  align = "left",
  height = "min-h-[380px] sm:min-h-[420px] lg:min-h-[560px]",
  seal = false,
  children,
}) {
  return (
    <div className="framed border-ink">
      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-2xl ${height} ${
          align === "center" ? "items-center justify-center text-center" : "justify-end"
        }`}
      >
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/35 to-ink/25"
          aria-hidden="true"
        />

        {badge ? (
          <span className="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1.5 font-poppins text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur sm:left-8 sm:top-8 sm:text-[11px]">
            {badge}
          </span>
        ) : null}

        {seal ? (
          <span className="absolute right-5 top-5 hidden h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-ink/70 text-center font-poppins text-[10px] font-bold leading-tight text-white sm:right-8 sm:top-8 sm:flex">
            EST.
            <br />
            1979
          </span>
        ) : null}

        <div
          className={[
            "relative flex w-full flex-col gap-4 px-6 pb-6 pt-20 sm:px-10 sm:pb-10 sm:pt-24 lg:p-12",
            align === "center" ? "items-center" : "items-start",
          ].join(" ")}
        >
          <h1
            className={[
              "font-poppins font-bold leading-[1.1] text-white",
              align === "center"
                ? "text-[26px] sm:text-[38px] lg:text-[48px]"
                : "text-[28px] sm:text-[40px] lg:text-[56px]",
            ].join(" ")}
          >
            {title}
          </h1>
          {text ? (
            <p
              className={[
                "font-arsenal text-sm leading-relaxed text-white/90 sm:text-base",
                align === "center" ? "max-w-[720px]" : "max-w-[640px]",
              ].join(" ")}
            >
              {text}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
