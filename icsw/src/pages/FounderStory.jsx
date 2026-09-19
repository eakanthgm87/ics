import { Link } from "react-router-dom";
import { Reveal } from "../components/common";
import { IconArrowRight, IconChevronDown } from "../components/Icons";

const CHAPTERS = [
  {
    id: "chapter-1",
    title: "1950 · Tamil Nadu → Mangalore",
    text: "Born in Tamil Nadu, raised in Mangalore. An early life driven by curiosity, resilience, and a deep appreciation for classical literature and local educational foundations.",
    tags: [{ label: "1950" }],
    img: "/images/chapter-1.svg",
    alt: "Heritage archway of the early campus",
  },
  {
    id: "chapter-2",
    title: "1979 · Thippasandra, 7 Students",
    text: "It began with 7 students and 2 teachers. A humble rented roof in Thippasandra where the dream of holistic international-grade teaching was first sown into fertile soil.",
    tags: [{ label: "1979" }],
    img: "/images/chapter-2.svg",
    alt: "The first classroom",
    reverse: true,
  },
  {
    id: "chapter-3",
    title: "1986 · HAL 3rd Stage Campus",
    text: "A permanent home in HAL 3rd Stage. Transitioning into full color as structural foundations took solid shape, paving way for broader creative corridors and advanced science blocks.",
    tags: [{ label: "New Campus", solid: true }, { label: "1986" }],
    img: "/images/chapter-3.svg",
    alt: "The HAL 3rd Stage campus building",
  },
  {
    id: "chapter-4",
    title: "1989 · First Graduates",
    text: "The first Class X batch graduates. A pivotal milestone where our educational philosophy bore its first ripe fruits, launching confident cultural ambassadors into the world.",
    tags: [{ label: "1989" }],
    img: "/images/chapter-4.svg",
    alt: "The first graduating batch on stage",
    reverse: true,
  },
  {
    id: "chapter-5",
    title: "Today · Legacy Continues",
    text: "Her legacy, your child's future. Empowering students to think critically, lead with empathy, and design a purposeful tomorrow on the global stage.",
    tags: [{ label: "TODAY", solid: true }],
    img: "/images/chapter-5.svg",
    alt: "The campus fountain plaza today",
    cta: true,
  },
];

export default function FounderStory() {
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
                Our Founders&apos; Chronicles
              </h1>
              <p className="subhead text-center text-base text-body sm:text-xl">
                The Chronicles of ICS: Five Chapters of Legacy &amp; Dedication
              </p>
              <div className="flex w-full flex-col gap-2.5 rounded-2xl border-l-[5px] border-brand bg-tint px-5 py-5">
                <p className="subhead text-center text-base text-ink sm:text-lg">
                  &quot;We didn&apos;t just build a company - we built a home for
                  ideas, for people, and for the stories that keep us moving
                  forward.&quot;
                </p>
                <p className="text-center font-poppins text-[13px] font-bold text-muted">
                  - The Founders
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
      {CHAPTERS.map((c) => (
        <section
          key={c.id}
          id={c.id}
          className="relative scroll-mt-24 bg-white py-14 lg:py-20"
        >
          <span className="absolute left-1/2 top-0 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border border-line bg-white text-brand shadow-[0_6px_16px_-8px_rgba(38,65,48,0.25)] lg:flex">
            <IconChevronDown />
          </span>

          <div className="shell grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-12">
            <Reveal
              className={[
                "framed h-[280px] w-full shadow-[0_14px_32px_-14px_rgba(38,65,48,0.25)] sm:h-[400px] lg:h-[560px]",
                c.reverse ? "lg:order-2" : "",
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
                c.reverse ? "lg:order-1" : "",
              ].join(" ")}
            >
              <span className="h-[5px] w-16 rounded-full bg-brand" />
              <h2 className="font-poppins text-[26px] font-bold leading-tight sm:text-[32px] lg:text-4xl">
                {c.title}
              </h2>
              <p className="font-arsenal text-base leading-[1.6] text-body">
                {c.text}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {c.cta ? (
                  <Link
                    to="/life-at-ics"
                    className="btn rounded-lg bg-ink px-5 py-3 text-white shadow-[0_10px_24px_-10px_rgba(38,65,48,0.6)] hover:bg-[#1b3123]"
                  >
                    Explore the campus
                    <IconArrowRight />
                  </Link>
                ) : null}
                {c.tags.map((t) => (
                  <span
                    key={t.label}
                    className={[
                      "rounded-lg border px-4 py-2.5 font-poppins text-[13px] font-bold text-ink",
                      t.solid
                        ? "border-transparent bg-ink text-white"
                        : "border-line bg-tint",
                    ].join(" ")}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <span className="absolute inset-x-0 bottom-0 mx-auto block w-[calc(100%-40px)] border-b border-dashed border-line" />
        </section>
      ))}

    </>
  );
}
