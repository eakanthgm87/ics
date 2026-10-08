import { Link, useLocation } from "react-router-dom";
import { useSchool } from "../api";
import { IconArrowRight, IconPhone, SocialIcon } from "./Icons";

/* Phones only: the three things parents most want, one thumb away.
   Numbers come from /admin → Site settings. The bar pads itself for the
   iPhone home indicator, and a spacer keeps it from covering the footer. */
export default function MobileActions() {
  const school = useSchool();
  const { pathname } = useLocation();
  const whatsapp = school.socials?.find((s) => s.name === "WhatsApp")?.href;
  const tel = `tel:${(school.mobile || school.phone || "").replace(/[^0-9+]/g, "")}`;

  const item =
    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 font-poppins text-[11px] font-bold text-ink transition-colors active:bg-tint";

  return (
    <>
      <div className="h-[calc(64px+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
      <nav
        aria-label="Quick contact"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-3 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_-12px_rgba(38,65,48,0.35)] backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-[480px] items-center gap-2">
          <a href={tel} className={item}>
            <IconPhone size={18} />
            Call
          </a>
          {whatsapp ? (
            <a href={whatsapp} target="_blank" rel="noreferrer" className={item}>
              <SocialIcon name="WhatsApp" size={18} />
              WhatsApp
            </a>
          ) : null}
          <Link
            to={pathname === "/admissions" ? "#registration" : "/admissions#registration"}
            className="flex flex-[1.6] items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 font-poppins text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(163,117,65,0.8)] active:bg-[#8f6435]"
          >
            Enquire Now
            <IconArrowRight size={16} />
          </Link>
        </div>
      </nav>
    </>
  );
}
