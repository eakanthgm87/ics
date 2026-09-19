import { Reveal } from "../components/common";

const STAGES = [
  {
    title: "Early Years Foundation",
    img: "/images/stage-early-years.svg",
    alt: "Early years classroom",
    text: "Our Play-based learning curriculum focuses on cognitive, sensory, and motor development. By engaging in thematic story-circles, structured outdoor games, and interactive digital sandboxes, children build crucial confidence and language foundations.",
    cards: [
      {
        tag: "Pre-K",
        title: "Sensory Play",
        text: "Interactive texture modules and rhythm training.",
      },
      {
        tag: "Kindergarten",
        title: "Pre-Numeracy",
        text: "Play-based math concepts and letter shapes.",
      },
    ],
  },
  {
    title: "Primary Academy",
    img: "/images/stage-primary.svg",
    alt: "Primary school art and activity session",
    reverse: true,
    text: "We introduce students to an inquiry-led pathway through the Karnataka State Education Board syllabus that triggers independent thinking. Math, Science, and Social Studies are presented through hands-on collaborative activities, instilling lifelong research habits and robust literacy.",
    cards: [
      {
        tag: "Grades 1-2",
        title: "Core Literacy",
        text: "Bilingual immersion and basic scientific models.",
      },
      {
        tag: "Grades 3-4",
        title: "Problem Solving",
        text: "Introductory robotics and critical text analysis.",
      },
    ],
  },
  {
    title: "Middle School",
    img: "/images/stage-middle.svg",
    alt: "Middle school science laboratory",
    text: "Transitioning towards formal scientific principles, analytical arithmetic, and deep historical insights. Middle school prepares students with dedicated physics, chemistry and biology laboratories, computer lab sessions, and structured public speaking training.",
    cards: [
      {
        tag: "Grades 5-6",
        title: "Lab Sciences",
        text: "Formal physics, chemistry, and biology lab modules.",
      },
      {
        tag: "Grade 7",
        title: "Civic Leadership",
        text: "Historical analysis and youth parliament mock sessions.",
      },
    ],
  },
  {
    title: "High School",
    img: "/images/stage-high.svg",
    alt: "High school seminar room",
    reverse: true,
    text: "Focused strictly on comprehensive board-exam alignment alongside holistic global mentorship. We maintain premium standards of counseling, supporting admissions to world-class higher secondary institutions and universities.",
    cards: [
      {
        tag: "Grades 8-9",
        title: "Conceptual Clarity",
        text: "Intense curriculum rigor across mathematics and computer science.",
      },
      {
        tag: "Grade 10",
        title: "Board Mastery",
        text: "Continuous mocks, personalized feedback loops, and career counseling.",
      },
    ],
  },
];

function StageCard({ tag, title, text }) {
  return (
    <div className="flex h-full flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-[0_12px_24px_-8px_rgba(87,101,95,0.18)] transition-transform duration-300 hover:-translate-y-1 lg:p-7">
      <span className="rounded-xl bg-chip px-3 py-1.5 font-poppins text-[11px] font-bold text-ink">
        {tag}
      </span>
      <p className="font-poppins text-xl font-bold text-ink">{title}</p>
      <p className="font-arsenal text-[13px] text-body">{text}</p>
    </div>
  );
}

export default function Academics() {
  return (
    <>
      <section className="bg-white pt-12 pb-6 lg:pt-20 lg:pb-10">
        <div className="shell flex flex-col items-start gap-4 text-left">
          <p className="eyebrow">Curriculum</p>
          <h1 className="font-poppins text-[34px] font-bold leading-[1.2] sm:text-[42px] lg:text-5xl">
            Academics
          </h1>
          <p className="max-w-[900px] font-arsenal text-base leading-[1.6] text-body">
            At Indiranagar Cambridge School, our carefully calibrated curriculum
            follows the Karnataka State Education Board (KSEEB) syllabus with
            English as the medium of instruction. We empower our students through
            active discovery, life skills, and holistic development from Nursery to
            Grade 10.
          </p>
        </div>
      </section>

      {STAGES.map((stage) => (
        <section
          key={stage.title}
          className="bg-white py-12 lg:py-16"
        >
          <div className="shell grid items-center gap-10 lg:grid-cols-[540px_minmax(0,1fr)] lg:gap-16">
            <Reveal
              className={[
                "framed h-[280px] w-full sm:h-[380px]",
                stage.reverse ? "lg:order-2" : "",
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
                stage.reverse ? "lg:order-1" : "",
              ].join(" ")}
            >
              <h2 className="font-poppins text-[26px] font-bold sm:text-[32px]">
                {stage.title}
              </h2>
              <p className="font-arsenal text-sm leading-[1.6] text-body">
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
