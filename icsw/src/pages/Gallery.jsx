import { useCallback, useEffect, useMemo, useState } from "react";
import { HeroBanner } from "../components/common";
import { useContent } from "../api";
import {
  IconChevronLeft,
  IconChevronRight,
  IconShare,
  SocialIcon,
} from "../components/Icons";

const TABS = ["All", "Sports", "Academics", "Events", "Campus"];

const FALLBACK_PHOTOS = [
  {
    src: "/images/gal-orchestra.svg",
    title: "School Orchestra",
    caption: "The senior orchestra rehearsing for the annual concert.",
    cat: "Events",
    span: "tall",
  },
  {
    src: "/images/gal-campus-life.svg",
    title: "Campus Life",
    caption: "Morning arrivals outside the main academic block.",
    cat: "Campus",
    span: "short",
  },
  {
    src: "/images/gal-sports.svg",
    title: "Athletics Meet",
    caption: "Inter-house track finals on the synthetic running track.",
    cat: "Sports",
    span: "mid",
  },
  {
    src: "/images/gal-library.svg",
    title: "Central Library",
    caption: "Quiet study hours in the school library and reading room.",
    cat: "Academics",
    span: "tall",
  },
  {
    src: "/images/gal-art-studio.svg",
    title: "Art Studio",
    caption: "Grade 6 students at work in the visual arts studio.",
    cat: "Academics",
    span: "short",
  },
  {
    src: "/images/gal-science-lab.svg",
    title: "Science Laboratory",
    caption: "Practical chemistry session for the middle school.",
    cat: "Academics",
    span: "mid",
  },
  {
    src: "/images/gal-debate.svg",
    title: "Debate Club",
    caption: "Youth parliament mock session in the seminar room.",
    cat: "Events",
    span: "short",
  },
  {
    src: "/images/gal-theatre.svg",
    title: "Annual Theatre",
    caption: "The senior school production on the main stage.",
    cat: "Events",
    span: "tall",
  },
  {
    src: "/images/gal-campus-detail.svg",
    title: "Heritage Archway",
    caption: "The original 1986 archway at the HAL 3rd Stage campus.",
    cat: "Campus",
    span: "short",
  },
];

const spanClass = {
  tall: "h-[320px] sm:h-[460px]",
  mid: "h-[260px] sm:h-[340px]",
  short: "h-[220px] sm:h-[240px]",
};

/* the circled X from the design spec */
function CloseGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10.0004 5.9998L6.00005 10.0001M6.00005 5.9998L10.0004 10.0001M14.6674 7.99996C14.6674 11.6822 11.6824 14.6672 8.00021 14.6672C4.31801 14.6672 1.33301 11.6822 1.33301 7.99996C1.33301 4.31777 4.31801 1.33276 8.00021 1.33276C11.6824 1.33276 14.6674 4.31777 14.6674 7.99996Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Lightbox({ photo, onClose, onPrev, onNext }) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/gallery`;
  const shareText = `${photo.title} — Indiranagar Cambridge School`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable (insecure origin / denied) — silently ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgba(0,0,0,0.82)] px-4 py-10 backdrop-blur-xl lg:py-20 motion-safe:animate-[lb-fade_.25s_ease-out]"
    >
      {/* previous / next sit on the backdrop, clear of the card */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:left-6"
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
        className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:right-6"
      >
        <IconChevronRight size={22} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[1080px] shrink-0 flex-col overflow-hidden bg-white shadow-[0_32px_64px_0_rgba(0,0,0,0.45)] motion-safe:animate-[lb-pop_.3s_cubic-bezier(0.16,1,0.3,1)] lg:h-[640px] lg:flex-row lg:items-start"
      >
        <img
          src={photo.src}
          alt={photo.title}
          className="h-[240px] w-full max-w-none object-cover sm:h-[340px] lg:h-full lg:flex-1"
        />

        <div className="flex w-full shrink-0 flex-col justify-between gap-8 border-line bg-white p-6 sm:p-10 lg:h-full lg:w-[380px] lg:border-l">
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full items-center justify-between">
              <span className="flex w-fit items-start bg-chip px-3 py-1.5 font-poppins text-[11px] font-bold text-ink">
                {photo.cat}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center bg-tint text-ink transition-colors hover:bg-chip"
              >
                <CloseGlyph />
              </button>
            </div>

            <h2 className="w-full font-poppins text-2xl font-bold leading-[1.3em] text-ink">
              {photo.title}
            </h2>
            <p className="w-full font-arsenal text-sm leading-[1.6em] text-body">
              {photo.caption}
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-4">
            <div className="h-px w-full bg-line" />
            <div className="flex w-full items-center justify-between">
              <p className="w-fit font-arsenal text-[13px] text-muted">
                {copied ? "Link copied" : "Share this moment"}
              </p>
              <div className="flex items-center gap-3 text-ink">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                  className="transition-colors hover:text-brand"
                >
                  <SocialIcon name="Facebook" size={20} />
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on WhatsApp"
                  className="transition-colors hover:text-brand"
                >
                  <SocialIcon name="WhatsApp" size={20} />
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="Copy link"
                  className="transition-colors hover:text-brand"
                >
                  <IconShare size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const PHOTOS = useContent("/gallery/", FALLBACK_PHOTOS);
  const [tab, setTab] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const visible = useMemo(
    () => (tab === "All" ? PHOTOS : PHOTOS.filter((p) => p.cat === tab)),
    [tab, PHOTOS]
  );

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
            image="/images/hero-gallery.svg"
            badge="Capturing memories & milestones"
            title="Gallery."
            height="min-h-[280px] sm:min-h-[340px] lg:min-h-[380px]"
            text="Step into the world of Indiranagar Cambridge School through our candid lens. Discover a warm archive of academic breakthroughs, spirited sporting events, creative performances, and everyday campus joy."
          />
        </div>
      </section>

      {/* ------------------------------------------------------ filter tabs */}
      <section className="bg-white pb-8">
        <div className="shell flex flex-wrap items-center justify-center gap-6 sm:gap-8">
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
                "pb-2 font-poppins text-base transition-colors",
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
            <p className="py-20 text-center font-arsenal text-base text-body">
              No photographs in this category yet.
            </p>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
              {visible.map((p, i) => (
                <button
                  type="button"
                  key={p.src + p.title}
                  onClick={() => setLightbox(i)}
                  className={[
                    "group relative mb-4 block w-full break-inside-avoid overflow-hidden text-left",
                    "transition-[transform,box-shadow] duration-500 ease-out",
                    "hover:z-10 hover:-translate-y-1 hover:shadow-[0_24px_40px_-16px_rgba(38,65,48,0.55)]",
                    spanClass[p.span],
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
          onClose={() => setLightbox(null)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      ) : null}
    </>
  );
}
