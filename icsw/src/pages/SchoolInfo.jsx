import { RichText } from "../components/common";
import { useSection, useSections } from "../api";

/* The footer's Accreditation / Affiliation / ... links all land here, each on
   its own section via the #id. Every section's text is edited in
   /admin → Page text & images. */
const SECTIONS = [
  { id: "accreditation", key: "info-accreditation" },
  { id: "affiliation", key: "info-affiliation" },
  { id: "parent-teacher-interaction", key: "info-parents" },
  { id: "safety-wellbeing", key: "info-safety" },
  { id: "child-safety", key: "info-child-safety" },
];

export default function SchoolInfo() {
  const intro = useSection("info-intro");
  const texts = useSections(SECTIONS.map((s) => s.key));
  const sections = SECTIONS.map((s, i) => ({ ...s, ...texts[i] }));

  return (
    <>
      <section className="bg-white pb-8 pt-12 lg:pb-12 lg:pt-20">
        <div className="shell flex flex-col items-start gap-4">
          <p className="eyebrow">{intro.eyebrow}</p>
          <h1 className="font-poppins text-[34px] font-bold leading-[1.15] sm:text-[44px] lg:text-[52px]">
            {intro.title}
          </h1>
          <p className="max-w-[760px] font-arsenal text-base leading-[1.7] text-body">
            {intro.body}
          </p>
        </div>
      </section>

      <section className="bg-white pb-16 lg:pb-24">
        <div className="shell grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
          {/* contents — sticks beside the sections on wide screens */}
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1 lg:border-l lg:border-line">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-full border border-line px-4 py-2 font-poppins text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:py-2.5 lg:pl-5"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-8">
            {sections.map((s, i) => (
              <article
                key={s.id}
                id={s.id}
                className="scroll-mt-28 rounded-3xl border border-line bg-white p-6 shadow-[0_14px_32px_-18px_rgba(38,65,48,0.25)] target:border-brand target:shadow-[0_0_0_3px_rgba(163,117,65,0.18)] sm:p-10"
              >
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tint font-poppins text-sm font-bold text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-poppins text-[24px] font-bold leading-tight sm:text-[30px]">
                    {s.title}
                  </h2>
                </div>
                <RichText text={s.body} />
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
