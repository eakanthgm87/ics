import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NAV_LINKS } from "../data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    [
      // the underline is always present; hover wipes it in, active pins it open
      "relative py-1 font-poppins text-sm font-normal uppercase tracking-wide transition-colors",
      "after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded after:bg-brand",
      "after:origin-left after:transition-transform after:duration-300 after:ease-out",
      isActive
        ? "text-ink font-bold after:scale-x-100"
        : "text-ink/80 after:scale-x-0 hover:text-ink hover:after:scale-x-100",
    ].join(" ");

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full border-b border-line bg-white/95 backdrop-blur transition-shadow",
        scrolled ? "shadow-[0_6px_20px_-12px_rgba(38,65,48,0.45)]" : "",
      ].join(" ")}
    >
      <nav className="shell flex h-[88px] items-center justify-between gap-6">
        <Link to="/" aria-label="Indiranagar Cambridge School — home">
          <img
            src="/images/logo-nav.svg"
            alt="The Indiranagar Cambridge School"
            className="h-12 w-auto sm:h-14"
            width="1039"
            height="289"
          />
        </Link>

        {/* desktop navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
          {/* deliberately not .btn — that class forces bold + a hover lift,
              which reads as heavy next to the regular-weight nav links */}
          <Link
            to="/contact"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-brand px-5 py-2 font-poppins text-sm font-normal uppercase tracking-wide text-white shadow-none transition-[background-color,box-shadow] duration-300 hover:bg-[#8f6435] hover:shadow-[0_8px_20px_-6px_rgba(163,117,65,0.7)]"
          >
            Contact Us
          </Link>
        </div>

        {/* mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-xl border border-line lg:hidden"
        >
          <span
            className={[
              "block h-0.5 w-5 bg-ink transition-transform",
              open ? "translate-y-[7px] rotate-45" : "",
            ].join(" ")}
          />
          <span
            className={[
              "block h-0.5 w-5 bg-ink transition-opacity",
              open ? "opacity-0" : "",
            ].join(" ")}
          />
          <span
            className={[
              "block h-0.5 w-5 bg-ink transition-transform",
              open ? "-translate-y-[7px] -rotate-45" : "",
            ].join(" ")}
          />
        </button>
      </nav>

      {/* mobile drawer */}
      <div
        id="mobile-nav"
        className={[
          "overflow-hidden border-t border-line bg-white transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-[520px]" : "max-h-0",
        ].join(" ")}
      >
        <div className="shell flex flex-col gap-1 py-4">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                [
                  "rounded-xl px-3 py-3 font-poppins text-[15px] uppercase tracking-wide",
                  isActive ? "bg-tint text-ink font-bold" : "text-ink/80 font-normal",
                ].join(" ")
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary mt-2 w-full uppercase tracking-wide">
            Contact Us
          </Link>
        </div>
      </div>
    </header>
  );
}
