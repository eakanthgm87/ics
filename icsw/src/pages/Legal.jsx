import { RichText } from "../components/common";
import { useSection } from "../api";

/* Privacy Policy and Terms of Service. The wording is edited in
   /admin → Page text & images ("Privacy Policy page" / "Terms of Service page"). */
export default function Legal({ sectionKey }) {
  const page = useSection(sectionKey);

  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="shell flex max-w-[960px] flex-col gap-8">
        <div className="flex flex-col items-start gap-4">
          <p className="eyebrow">The Indiranagar Cambridge School</p>
          <h1 className="font-poppins text-[34px] font-bold leading-[1.15] sm:text-[44px]">
            {page.title}
          </h1>
          <span className="h-[3px] w-14 rounded-full bg-brand" />
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 shadow-[0_14px_32px_-18px_rgba(38,65,48,0.25)] sm:p-10">
          <RichText text={page.body} />
        </div>
      </div>
    </section>
  );
}
