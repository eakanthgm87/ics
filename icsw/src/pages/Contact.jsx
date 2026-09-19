import { useState } from "react";
import { submitEnquiry } from "../api";
import { HeroBanner, Reveal } from "../components/common";
import {
  IconCheck,
  IconClock,
  IconMail,
  IconMobile,
  IconPhone,
} from "../components/Icons";
import { SCHOOL } from "../data/site";

const DIRECTORY = [
  {
    icon: IconPhone,
    label: "Main Office Landline",
    value: SCHOOL.phone,
    href: `tel:${SCHOOL.phone.replace(/[^0-9+]/g, "")}`,
  },
  {
    icon: IconMobile,
    label: "Admissions Inquiry Mobile",
    value: SCHOOL.mobile,
    href: `tel:${SCHOOL.mobile.replace(/[^0-9+]/g, "")}`,
  },
  {
    icon: IconMail,
    label: "Email Support",
    value: SCHOOL.email,
    href: `mailto:${SCHOOL.email}`,
  },
  {
    icon: IconClock,
    label: "Administrative Hours",
    value: `${SCHOOL.hoursWeek}\n${SCHOOL.hoursSat}`,
  },
];

const SUBJECTS = [
  "Admissions & Registration",
  "Campus Visit / Tour",
  "Fees & Scholarships",
  "Transport & Facilities",
  "Careers at ICS",
  "Something else",
];

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const n = { ...e };
      delete n[name];
      return n;
    });
    setSent(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const message = values.message.trim();

    if (!name) next.name = "Please tell us your name";
    else if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(name))
      next.name = "Use letters only";
    else if (name.length < 2) next.name = "At least 2 characters";
    else if (name.length > 60) next.name = "Must be under 60 characters";

    if (!email) next.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address";
    else if (email.length > 120) next.email = "Must be under 120 characters";

    // phone stays optional, but is checked once something is typed
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (!/^[\d\s+()-]+$/.test(phone))
        next.phone = "Digits, spaces and + ( ) - only";
      else if (digits.length < 10) next.phone = "Enter at least 10 digits";
      else if (digits.length > 15) next.phone = "That number looks too long";
    }

    if (!values.subject) next.subject = "Choose a subject";
    else if (!SUBJECTS.includes(values.subject))
      next.subject = "Choose an option from the list";

    if (!message) next.message = "Please tell us how we can help";
    else if (message.length < 10)
      next.message = "Please add a little more detail (10+ characters)";
    else if (message.length > 1000)
      next.message = "Please keep it under 1000 characters";

    setErrors(next);
    if (Object.keys(next).length) {
      const first = document.querySelector(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      return;
    }
    setBusy(true);
    const res = await submitEnquiry(values);
    setBusy(false);

    if (!res.ok) {
      setErrors(res.message ? { form: res.message } : res.errors);
      return;
    }
    setValues(EMPTY);
    setSent(true);
  };

  return (
    <>
      <section className="bg-white py-10 lg:py-20">
        <div className="shell">
          <HeroBanner
            image="/images/hero-contact.svg"
            badge="Get in touch"
            align="center"
            title="Connect with Indiranagar Cambridge School"
            height="min-h-[260px] sm:min-h-[300px] lg:min-h-[320px]"
            text="We are happy to answer your questions about classes, curriculum steps, or virtual tours. Reach out directly."
          />
        </div>
      </section>

      {/* ------------------------------------------------- directory + map */}
      <section className="bg-white pb-12 lg:pb-20">
        <div className="shell grid gap-8 lg:grid-cols-2">
          <Reveal className="flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-6 lg:p-8">
            <h2 className="font-poppins text-xl font-bold">Contact Directory</h2>
            <div className="flex w-full flex-col gap-5">
              {DIRECTORY.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-ink/10 text-ink">
                    <Icon />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-poppins text-xs font-bold uppercase tracking-wide text-muted">
                      {label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        className="font-poppins text-[15px] font-bold text-ink transition-colors hover:text-brand"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="whitespace-pre-line font-poppins text-[15px] font-bold text-ink">
                        {value}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={SCHOOL.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-dark mt-auto"
            >
              Get Directions
            </a>
          </Reveal>

          <Reveal
            className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_28px_-14px_rgba(38,65,48,0.25)]"
            style={{ transitionDelay: "90ms" }}
          >
            {/* a fixed map image — clicking it opens the campus in Google Maps */}
            <a
              href={SCHOOL.mapsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${SCHOOL.name} in Google Maps`}
              className="group block h-full w-full overflow-hidden"
            >
              <img
                src="/images/campus-map.jpg"
                alt={`Map showing ${SCHOOL.name}, ${SCHOOL.address}`}
                width="1200"
                height="803"
                loading="lazy"
                className="h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-[400px] lg:h-full"
              />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ enquiry form */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="shell">
          <div className="framed">
            <form
              noValidate
              onSubmit={onSubmit}
              className="flex flex-col items-start gap-8 rounded-2xl bg-white p-6 sm:p-8 lg:p-10"
            >
              <div className="flex flex-col items-start gap-2">
                <p className="font-poppins text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
                  Enquiry Form
                </p>
                <h2 className="font-poppins text-[26px] font-bold leading-[1.3] sm:text-[32px]">
                  Send Us a Message
                </h2>
              </div>

              <div className="grid w-full gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="field-label">
                    Full Name <span className="text-brand">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    className={`field ${errors.name ? "border-red-400" : ""}`}
                    placeholder="e.g. Amit Kumar"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                  {errors.name ? (
                    <p className="font-arsenal text-xs text-red-600">{errors.name}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="field-label">
                    Email Address <span className="text-brand">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`field ${errors.email ? "border-red-400" : ""}`}
                    placeholder="e.g. amit@email.com"
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                  {errors.email ? (
                    <p className="font-arsenal text-xs text-red-600">{errors.email}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="field-label">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`field ${errors.phone ? "border-red-400" : ""}`}
                    placeholder="e.g. +91 99000 12345"
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                  {errors.phone ? (
                    <p className="font-arsenal text-xs text-red-600">{errors.phone}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="field-label">
                    Subject of Inquiry <span className="text-brand">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className={`field ${errors.subject ? "border-red-400" : ""}`}
                    value={values.subject}
                    onChange={(e) => set("subject", e.target.value)}
                  >
                    <option value="">Choose Subject</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.subject ? (
                    <p className="font-arsenal text-xs text-red-600">
                      {errors.subject}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <label htmlFor="message" className="field-label">
                  Your Message / Query Details <span className="text-brand">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className={`field resize-y ${errors.message ? "border-red-400" : ""}`}
                  placeholder="Type details about your enquiry here..."
                  value={values.message}
                  onChange={(e) => set("message", e.target.value)}
                />
                {errors.message ? (
                  <p className="font-arsenal text-xs text-red-600">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <div className="flex w-full flex-col items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-primary px-10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Submit Message"}
                </button>

                {errors.form ? (
                  <p
                    role="alert"
                    className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-center font-arsenal text-sm text-red-700"
                  >
                    {errors.form}
                  </p>
                ) : null}
                {sent ? (
                  <p
                    role="status"
                    className="flex items-center gap-3 rounded-2xl border border-ink bg-success px-5 py-3 font-arsenal text-sm text-ink"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white">
                      <IconCheck />
                    </span>
                    Thank you — your message has reached the campus office. We reply
                    within one working day.
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
