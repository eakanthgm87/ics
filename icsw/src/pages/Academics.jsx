import { Reveal } from "../components/common";
import { useContent, useSection } from "../api";
import CONTENT from "../data/content.json";

function StageCard({ tag, title, text }) {
  return (
    <div className="flex h-full flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-[0_12px_24px_-8px_rgba(87,101,95,0.18)] transition-transform duration-300 hover:-translate-y-1 lg:p-7">
      <span className="rounded-xl bg-chip px-3 py-1.5 font-poppins text-[11px] font-bold text-ink">
        {tag}
      </span>
      <p className="font-poppins text-xl font-bold text-ink">{title}</p>
      <p className="font-poppins text-[13px] text-body">{text}</p>
    </div>
  );
}

export default function Academics() {
  const STAGES = useContent("/stages/", CONTENT.stages);
  const intro = useSection("academics-intro");

  return (
    <>
      <section className="bg-white pt-12 pb-6 lg:pt-20 lg:pb-10">
        <div className="shell flex flex-col items-start gap-4 text-left">
          <p className="eyebrow">{intro.eyebrow}</p>
          <h1 className="font-poppins text-[34px] font-bold leading-[1.2] sm:text-[42px] lg:text-5xl">
            {intro.title}
          </h1>
          <p className="max-w-[900px] font-poppins text-base leading-[1.6] text-body">
            {intro.body}
          </p>
        </div>
      </section>

      {STAGES.map((stage, i) => (
        <section
          key={stage.title}
          className="bg-white py-12 lg:py-16"
        >
          <div className="shell grid items-center gap-10 lg:grid-cols-2 xl:grid-cols-[540px_minmax(0,1fr)] lg:gap-16">
            <Reveal
              className={[
                "framed h-[280px] w-full sm:h-[380px]",
                i % 2 ? "lg:order-2" : "",
              ].join(" ")}
            >
              <img
                src={stage.img}
                alt={stage.alt}
                className="h-full w-full rounded-xl object-cover"
                loading="lazy"
              />
            </Reveal>

            <div
              className={[
                "flex flex-col items-start gap-6",
                i % 2 ? "lg:order-1" : "",
              ].join(" ")}
            >
              <h2 className="font-poppins text-[26px] font-bold sm:text-[32px]">
                {stage.title}
              </h2>
              <p className="copy-justify font-poppins text-sm leading-[1.6] text-body">
                {stage.text}
              </p>
              <div className="grid w-full gap-4 sm:grid-cols-2">
                {stage.cards.map((c) => (
                  <StageCard key={c.title} {...c} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

    </>
  );
}
