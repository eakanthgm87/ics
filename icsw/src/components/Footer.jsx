import { Link } from "react-router-dom";
import { FOOTER_LINKS, SCHOOL, SOCIALS } from "../data/site";
import { SocialIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="bg-ink pt-14 pb-5 text-white">
      <div className="shell flex flex-col gap-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,405px)_minmax(0,187px)_minmax(0,296px)] lg:justify-between lg:gap-16">
          <div className="flex flex-col items-start gap-4">
            <Link to="/" aria-label="Indiranagar Cambridge School — home">
              <img
                src="/images/logo-block-footer.svg"
                alt="The Indiranagar Cambridge School"
                className="h-12 w-auto sm:h-14"
                width="1039"
                height="289"
              />
            </Link>
            <p className="font-arsenal text-sm text-white/80">
              Empowering students to think critically, lead with empathy, and design
              a purposeful tomorrow on the global stage.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2.5">
            <p className="subhead text-sm tracking-[0.0714em] text-brand">
              Useful Links
            </p>
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="font-arsenal text-sm text-white/80 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-start gap-2.5">
            <p className="subhead text-sm tracking-[0.0714em] text-brand">
              Campus Location
            </p>
            <a
              href={SCHOOL.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="font-arsenal text-sm text-white/80 transition-colors hover:text-white"
            >
              {/* leading # in Poppins, slightly smaller — Arsenal's own # is
                  light and Arsenal only ships at 400 */}
              <span className="font-poppins text-[0.92em] font-normal text-white">#</span>
              {SCHOOL.address.replace(/^#/, "")}
            </a>
            <a
              href={`tel:${SCHOOL.phone.replace(/[^0-9+]/g, "")}`}
              className="font-arsenal text-sm text-white/80 transition-colors hover:text-white"
            >
              Phone: {SCHOOL.phone}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4">
          <p className="subhead text-sm tracking-[0.0714em] text-brand">
            Connect with us
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.name}
                className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-brand"
              >
                <SocialIcon name={s.name} size={20} />
                {/* name appears above the icon on hover / keyboard focus */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 font-poppins text-[11px] font-bold uppercase tracking-wide text-white opacity-0 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {s.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* 5px rule in Warm Ochre Brown */}
        <div className="h-[5px] w-full rounded-full bg-brand" />

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="font-arsenal text-xs text-white/50">
            © {new Date().getFullYear()} Indiranagar Cambridge School. All rights
            reserved.
          </p>
          <div className="flex items-start gap-6">
            <Link
              to="/contact"
              className="font-arsenal text-xs text-white/50 hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="font-arsenal text-xs text-white/50 hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
