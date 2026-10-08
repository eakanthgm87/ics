import { useCallback, useEffect, useMemo, useState } from "react";
import { HeroBanner, useSwipe } from "../components/common";
import { useContent, useSection } from "../api";
import CONTENT from "../data/content.json";
import {
  IconCheck,
  IconChevronLeft,
  IconClose,
  IconChevronRight,
  IconShare,
  SocialIcon,
} from "../components/Icons";

const TABS = ["All", "Sports", "Academics", "Events", "Campus"];

/* Masonry on a grid of equal rows: "tall" tiles take two rows, the rest one.
   Each photo goes into the shortest column (so there are never holes), then
   short columns are evened up by letting their last one-row tiles grow —
   the gallery always ends as a clean rectangle. Returns each photo's
   { col, row, span }, in the photos' own order. */
function layout(photos, cols) {
  const columns = Array.from({ length: cols }, () => []);
  const height = Array(cols).fill(0);
  photos.forEach((p, i) => {
    const c = height.indexOf(Math.min(...height));
    const span = p.span === "tall" ? 2 : 1;
    columns[c].push({ i, span });
    height[c] += span;
  });
  const max = Math.max(...height);
  columns.forEach((col, c) => {
    for (let k = col.length - 1; k >= 0 && height[c] < max; k--) {
      if (col[k].span === 1) {
        col[k].span = 2;
        height[c]++;
      }
    }
    // no one-row tiles left to grow (e.g. a column of tall ones): stretch the last
    if (col.length && height[c] < max) col.at(-1).span += max - height[c];
  });
  const out = [];
  columns.forEach((col, c) => {
    let row = 1;
    for (const t of col) {
      out[t.i] = { col: c + 1, row, span: t.span };
      row += t.span;
    }
  });
  return out;
}

/* matches the grid's breakpoints: 1 / sm 2 / lg 3 / xl 4 columns */
function useColumns() {
  const get = () => {
    const w = typeof window === "undefined" ? 1280 : window.innerWidth;
    return w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1;
  };
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const on = () => setCols(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return cols;
}

function Lightbox({ photo, index, total, onClose, onPrev, onNext }) {
  // swipe left for the next photo, right for the previous one
  const swipe = useSwipe(onNext, onPrev);
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/gallery`;
  const shareText = `${photo.title} — Indiranagar Cambridge School`;
  const pad = (n) => String(n).padStart(2, "0");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable (insecure origin / denied) — silently ignore
    }
  };

  const round =
    "flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,14,10,0.86)] px-4 py-6 backdrop-blur-xl sm:px-20 motion-safe:animate-[lb-fade_.25s_ease-out]"
    >
      {/* previous / next sit on the backdrop, clear of the photo */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
        className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink sm:flex lg:left-6"
      >
        <IconChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
        className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink sm:flex lg:right-6"
      >
        <IconChevronRight size={22} />
      </button>

      {/* close, in the corner where people look for it */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink lg:right-6 lg:top-6"
      >
        <IconClose size={20} />
      </button>

      <figure
        key={photo.src /* replay the entrance when stepping */}
        onClick={(e) => e.stopPropagation()}
        {...swipe}
        // width follows the photo, so the caption lines up with its edges
        className="flex w-fit max-w-full flex-col motion-safe:animate-[lb-pop_.35s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* the photo at its own shape: no letterbox bars, never too big */}
        <img
          src={photo.src}
          alt={photo.title}
          className="block max-h-[68vh] w-auto max-w-full object-contain shadow-[0_30px_80px_-24px_rgba(0,0,0,0.85)] sm:max-w-[min(980px,calc(100vw-10rem))]"
        />

        {/* editorial caption: zero-width box so long text never widens the figure */}
        <figcaption className="@container w-0 min-w-full border-t border-white/15 pt-4 text-white sm:pt-5">
          {/* side by side only when the caption is wide enough (a tall,
              narrow photo gives a narrow caption: share then sits below) */}
          <div className="flex flex-col gap-4 @lg:flex-row @lg:items-start @lg:justify-between @lg:gap-10">
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="font-poppins text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                {photo.cat}
                <span className="mx-2 text-white/30">—</span>
                <span className="tabular-nums">
                  {pad(index + 1)} / {pad(total)}
                </span>
              </p>
              <h2 className="font-poppins text-xl font-bold leading-snug text-white sm:text-2xl">
                {photo.title}
              </h2>
              {photo.caption ? (
                <p className="max-w-[560px] font-poppins text-sm leading-relaxed text-white/70">
                  {photo.caption}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-1 @lg:pt-0.5">
              <span className="mr-2 font-poppins text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
                {copied ? "Link copied" : "Share"}
              </span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on Facebook"
                className={round}
              >
                <SocialIcon name="Facebook" size={17} />
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on WhatsApp"
                className={round}
              >
                <SocialIcon name="WhatsApp" size={17} />
              </a>
              <button
                type="button"
                onClick={copyLink}
                aria-label={copied ? "Link copied" : "Copy link"}
                title={copied ? "Link copied" : "Copy link"}
                className={round}
              >
                {copied ? <IconCheck size={15} /> : <IconShare size={17} />}
              </button>
            </div>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}

export default function Gallery() {
  const PHOTOS = useContent("/gallery/", CONTENT.gallery);
  const hero = useSection("gallery-hero");
  const [tab, setTab] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const visible = useMemo(
    () => (tab === "All" ? PHOTOS : PHOTOS.filter((p) => p.cat === tab)),
    [tab, PHOTOS]
  );
  const cols = useColumns();
  const place = useMemo(() => layout(visible, cols), [visible, cols]);

  const count = visible.length;
  const step = useCallback(
    (dir) => setLightbox((i) => (i === null ? i : (i + dir + count) % count)),
    [count]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, step]);

  const active = lightbox === null ? null : visible[lightbox];

  return (
    <>
      <section className="bg-white py-10 lg:py-20">
        <div className="shell">
          <HeroBanner
            image={hero.img}
            badge={hero.eyebrow}
            title={hero.title}
            height="min-h-[280px] sm:min-h-[340px] lg:min-h-[380px]"
            text={hero.body}
          />
        </div>
      </section>

      {/* ------------------------------------------------------ filter tabs */}
      <section className="bg-white pb-8">
        <div className="shell flex items-center gap-6 overflow-x-auto [scrollbar-width:none] sm:justify-center sm:gap-8 [&>button]:shrink-0">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setLightbox(null);
              }}
              aria-pressed={tab === t}
              className={[
                "min-h-11 min-w-11 pb-2 pt-2 font-poppins text-base transition-colors",
                tab === t
                  ? "border-b-[3px] border-ink font-bold text-ink"
                  : "border-b-[3px] border-transparent font-normal text-ink/70 hover:text-ink",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- masonry */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="shell">
          {visible.length === 0 ? (
            <p className="py-20 text-center font-poppins text-base text-body">
              No photographs in this category yet.
            </p>
          ) : (
            <div
              className="grid auto-rows-[220px] gap-4 lg:auto-rows-[240px]"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {visible.map((p, i) => (
                <button
                  type="button"
                  key={p.src + p.title}
                  onClick={() => setLightbox(i)}
                  style={{
                    gridColumn: place[i].col,
                    gridRow: `${place[i].row} / span ${place[i].span}`,
                  }}
                  className={[
                    "group relative block h-full w-full overflow-hidden rounded-xl text-left",
                    "transition-[transform,box-shadow] duration-500 ease-out",
                    "hover:z-10 hover:-translate-y-1 hover:shadow-[0_24px_40px_-16px_rgba(38,65,48,0.55)]",
                  ].join(" ")}
                  aria-label={`Open ${p.title}`}
                >
                  <img
                    src={p.src}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  />

                  {/* permanent caption bar, deepens on hover */}
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* ochre keyline wipes in from the bottom */}
                  <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100" />

                  <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 transition-transform duration-500 ease-out group-hover:-translate-y-1">
                    <span className="w-fit bg-brand px-2 py-0.5 font-poppins text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                      {p.cat}
                    </span>
                    <span className="font-poppins text-sm font-bold text-white drop-shadow">
                      {p.title}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {active ? (
        <Lightbox
          photo={active}
          index={lightbox}
          total={visible.length}
          onClose={() => setLightbox(null)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      ) : null}
    </>
  );
}
