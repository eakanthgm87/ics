import { HeroBanner, Reveal } from "../components/common";

const FACILITIES = [
  {
    title: "Sports",
    img: "/images/facility-sports.svg",
    alt: "Students playing football on the school field",
    text: "Cricket, kho kho, shuttle badminton, chess, kabaddi, throwball and volleyball run through the year, building up to Swift — the school's annual inter-class and inter-house sports meet.",
  },
  {
    title: "Laboratories",
    img: "/images/facility-labs.svg",
    alt: "Students working in the science laboratory",
    reverse: true,
    text: "Empowered with high-grade laboratory equipment, our separate Physics, Chemistry, and Biology hubs invite students to experiment, dissect, and theorize under strict safety compliance. STEM integration starts here, connecting formulas from text to tactile real-world reactions.",
  },
  {
    title: "Library",
    img: "/images/facility-library.svg",
    alt: "The central school library",
    text: "Books are made available to the children to encourage independent learning, intellectual curiosity and a lifelong passion for reading. The collection spans science and technology, Hindi, Kannada and English literature, encyclopedias and dictionaries, art and craft, Vedic mathematics, sports, and yoga and health.",
  },
  {
    title: "Reading Room",
    img: "/images/facility-reading.svg",
    alt: "The quiet reading room",
    reverse: true,
    text: "Designed with soundproof acoustic panels, soft ergonomics, and natural daylight orientation, our reading rooms are curated specifically for private contemplation, exam preparations, and independent creative writing. Free from digital noise, it fosters pure deep-work.",
  },
  {
    title: "Multimedia",
    img: "/images/facility-multimedia.svg",
    alt: "The multimedia and design lab",
    text: "Equipped with powerful graphics workstations, digital drafting software, and audio-video edit suites, the multimedia center teaches students the core syntax of digital design, computer-aided mathematics, spatial coding, and professional media composition.",
  },
];

export default function LifeAtIcs() {
  return (
    <>
      <section className="bg-white py-10 lg:py-20">
        <div className="shell">
          <HeroBanner
            image="/images/hero-life.svg"
            badge="Explore our campus"
            title="Life at ICS"
            height="min-h-[280px] sm:min-h-[340px] lg:min-h-[380px]"
            text="Discover the vibrant world of Indiranagar Cambridge School - from well-equipped labs and libraries to spirited sports and creative multimedia, our campus nurtures every dimension of student growth."
          />
        </div>
      </section>

      {FACILITIES.map((f) => (
        <section
          key={f.title}
          className="bg-white py-12 lg:py-16"
        >
          <div className="shell grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_620px] lg:gap-16">
            <div
              className={[
                "flex flex-col items-start gap-6",
                f.reverse ? "lg:order-2" : "",
              ].join(" ")}
            >
              <div className="flex items-center gap-5">
                <span className="h-11 w-2 shrink-0 rounded bg-ink lg:h-14" />
                <h2 className="font-poppins text-[28px] font-bold leading-tight sm:text-[32px] lg:text-4xl">
                  {f.title}
                </h2>
              </div>
              <p className="font-arsenal text-base leading-[1.6] text-body">
                {f.text}
              </p>
            </div>

            <Reveal
              className={[
                "framed h-[280px] w-full sm:h-[380px] lg:h-[460px]",
                f.reverse ? "lg:order-1" : "",
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
