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

/**
 * Touch swipe → onLeft / onRight. Spread the result onto an element:
 *   <div {...useSwipe(next, prev)}>
 * Only clearly horizontal swipes count, so vertical scrolling is untouched.
 */
export function useSwipe(onLeft, onRight, threshold = 50) {
  const start = useRef(null);
  return {
    onTouchStart: (e) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        (dx < 0 ? onLeft : onRight)();
      }
    },
  };
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

/**
 * Admin-edited text with a little structure. Blocks are separated by a
 * blank line; inside a block "### " starts a sub-heading, "- " a bullet and
 * "  - " a nested bullet. Everything else is a paragraph.
 */
export function RichText({ text = "" }) {
  const out = [];
  let list = null;
  const flush = () => {
    if (list) out.push(list);
    list = null;
  };
  text.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    if (/^\s{2,}- /.test(line) && list) {
      const last = list.items[list.items.length - 1];
      last.sub.push(line.trim().slice(2));
    } else if (line.startsWith("- ")) {
      list ??= { type: "ul", key: i, items: [] };
      list.items.push({ text: line.slice(2), sub: [] });
    } else {
      flush();
      if (line.startsWith("### ")) out.push({ type: "h3", key: i, text: line.slice(4) });
      else if (line.trim()) out.push({ type: "p", key: i, text: line.trim() });
    }
  });
  flush();

  return (
    <div className="flex w-full flex-col gap-4">
      {out.map((b) =>
        b.type === "h3" ? (
          <h3 key={b.key} className="mt-2 font-poppins text-lg font-bold text-ink">
            {b.text}
          </h3>
        ) : b.type === "ul" ? (
          <ul
            key={b.key}
            // a list of short items (games, subjects...) reads better in columns
            className={
              b.items.every((it) => it.text.length <= 34 && !it.sub.length)
                ? "grid gap-x-6 gap-y-2.5 sm:grid-cols-2"
                : "flex flex-col gap-2.5"
            }
          >
            {b.items.map((it) => (
              <li key={it.text} className="copy-justify flex gap-3 font-poppins text-[15px] leading-[1.65] text-body">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>
                  {it.text}
                  {it.sub.length ? (
                    <ul className="mt-2 flex flex-col gap-1.5 pl-1">
                      {it.sub.map((s) => (
                        <li key={s} className="flex gap-2.5">
                          <span className="mt-[9px] h-1 w-2.5 shrink-0 rounded-full bg-chip" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={b.key} className="copy-justify font-poppins text-[15px] leading-[1.7] text-body">
            {b.text}
          </p>
        )
      )}
    </div>
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
const BADGE =
  "rounded-full bg-black px-4 py-2 font-poppins text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.6)] ring-1 ring-white/20 [text-shadow:none] sm:text-xs";

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
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* an even slate-grey coat over the whole photo, so white text
            reads anywhere on it while the picture still shows through */}
        <div className="absolute inset-0 bg-[#1f2933]/55" aria-hidden="true" />

        {/* tablets and up: pinned top-left; phones get it in the text column
            below so it can never sit on top of the heading */}
        {badge ? <span className={`${BADGE} absolute left-8 top-8 hidden sm:inline-block`}>{badge}</span> : null}

        {seal ? (
          <span className="absolute right-5 top-5 hidden h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-ink/70 text-center font-poppins text-[10px] font-bold leading-tight text-white sm:right-8 sm:top-8 sm:flex">
            EST.
            <br />
            1979
          </span>
        ) : null}

        <div
          className={[
            "relative flex w-full flex-col gap-4 px-5 pb-6 pt-6 sm:px-10 sm:pb-10 sm:pt-24 lg:px-12 lg:pb-12",
            "[&>h1]:[text-shadow:0_2px_14px_rgba(0,0,0,0.45)] [&>p]:[text-shadow:0_1px_10px_rgba(0,0,0,0.5)]",
            align === "center" ? "items-center" : "items-start",
          ].join(" ")}
        >
          {badge ? <span className={`${BADGE} w-fit sm:hidden`}>{badge}</span> : null}
          <h1
            className={[
              "break-words font-poppins font-bold leading-[1.1] text-white",
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
                "font-poppins text-[15px] leading-relaxed text-white sm:text-[17px]",
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
