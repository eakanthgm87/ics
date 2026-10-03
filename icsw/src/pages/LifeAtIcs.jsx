import { HeroBanner, Reveal } from "../components/common";
import { paragraphs, useContent, useSection } from "../api";
import CONTENT from "../data/content.json";

export default function LifeAtIcs() {
  const FACILITIES = useContent("/facilities/", CONTENT.facilities);
  const hero = useSection("life-hero");

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

      {/* every other section swaps photo and copy sides */}
      {FACILITIES.map((f, i) => (
        <section key={f.title} className="bg-white py-12 lg:py-16">
          <div className="shell grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_620px] lg:gap-16">
            <div
              className={[
                "flex flex-col items-start gap-6",
                i % 2 ? "lg:order-2" : "",
              ].join(" ")}
            >
              <div className="flex items-center gap-5">
                <span className="h-11 w-2 shrink-0 rounded bg-ink lg:h-14" />
                <h2 className="font-poppins text-[28px] font-bold leading-tight sm:text-[32px] lg:text-4xl">
                  {f.title}
                </h2>
              </div>
              {paragraphs(f.text).map((p) => (
                <p key={p} className="font-arsenal text-base leading-[1.6] text-body">
                  {p}
                </p>
              ))}
              {f.tagline ? (
                <p className="font-poppins text-base font-bold text-ink">{f.tagline}</p>
              ) : null}
            </div>

            <Reveal
              className={[
                "framed h-[280px] w-full sm:h-[380px] lg:h-[460px]",
                i % 2 ? "lg:order-1" : "",
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
      ))}
    </>
  );
}
