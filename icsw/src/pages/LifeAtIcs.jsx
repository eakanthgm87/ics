import { HeroBanner, Reveal, RichText } from "../components/common";
import { useContent, useSection } from "../api";
import CONTENT from "../data/content.json";

function Heading({ title }) {
  return (
    <div className="flex items-center gap-5">
      <span className="h-11 w-2 shrink-0 rounded bg-ink lg:h-14" />
      <h2 className="font-poppins text-[28px] font-bold leading-tight sm:text-[32px] lg:text-4xl">
        {title}
      </h2>
    </div>
  );
}

export default function LifeAtIcs() {
  const FACILITIES = useContent("/facilities/", CONTENT.facilities);
  const hero = useSection("life-hero");
  let side = 0; // photo side alternates across the sections that have one

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

      {FACILITIES.map((f) => {
        const copy = (
          <>
            <Heading title={f.title} />
            <RichText text={f.text} />
            {f.tagline ? (
              <p className="font-poppins text-base font-bold text-ink">{f.tagline}</p>
            ) : null}
          </>
        );

        // no photo (yet): the text gets the full width on a soft green panel
        if (!f.img) {
          return (
            <section key={f.title} className="bg-white py-12 lg:py-16">
              <div className="shell">
                <div className="rounded-3xl border border-line bg-tint px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
                  <div className="flex max-w-[860px] flex-col gap-6">{copy}</div>
                </div>
              </div>
            </section>
          );
        }

        const flip = side++ % 2 === 1;
        return (
          <section key={f.title} className="bg-white py-12 lg:py-16">
            {/* photo level with the heading; it stays in view while longer
                text scrolls past, then leaves with its section */}
            <div className="shell grid items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:grid-cols-[minmax(0,1fr)_620px]">
              <div className={["flex flex-col items-start gap-6", flip ? "lg:order-2" : ""].join(" ")}>
                {copy}
              </div>

              <Reveal
                className={[
                  "framed h-[280px] w-full sm:h-[380px] lg:sticky lg:top-28 lg:h-[460px]",
                  flip ? "lg:order-1" : "",
                ].join(" ")}
              >
                <img
                  src={f.img}
                  alt={f.alt}
                  className="h-full w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </Reveal>
            </div>
          </section>
        );
      })}
    </>
  );
}
