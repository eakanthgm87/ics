import { useRef, useState } from "react";
import { submitAdmission, toFormFields } from "../api";
import { HeroBanner, Reveal } from "../components/common";
import { IconCheck, IconUpload } from "../components/Icons";

const STEPS = [
  {
    n: "01",
    title: "Enquiry",
    text: "Submit an online enquiry or visit the campus office.",
  },
  {
    n: "02",
    title: "Campus Visit",
    text: "Interact with our academic counsellors and explore facilities.",
  },
  {
    n: "03",
    title: "Application",
    text: "Fill out the registration dossier with academic history.",
  },
  {
    n: "04",
    title: "Document Verification",
    text: "Present transfer credentials, certificate transcripts, and photo proof.",
  },
  {
    n: "05",
    title: "Enrollment",
    text: "Secure the seat by paying structural fees upon evaluation.",
  },
];

const DOCUMENTS = [
  "Government Issued Birth Certificate",
  "Official Transfer Certificate (TC) from past school",
  "Previous Year Academic Marks Card/Transcripts",
  "Recent Passport-Sized Photographs of Student",
  "Address Proof of Parent/Guardian (Passport, Aadhaar, Utility)",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[A-Za-z][A-Za-z\s.'-]*$/;          // letters, spaces, . ' -
const WORDS_RE = /^[A-Za-z][A-Za-z\s./'&-]*$/;       // free text, no digits
const MAX_FILE = 5 * 1024 * 1024;

/* Each field carries its own rule so validate() stays a single loop.
   `rule` returns an error string, or nothing when the value is acceptable. */
const FIELDS = [
  {
    name: "firstName", label: "Student First Name", placeholder: "e.g. Rahul", required: true,
    rule: (v) =>
      !NAME_RE.test(v) ? "Use letters only" :
      v.trim().length < 2 ? "At least 2 characters" :
      v.trim().length > 50 ? "Must be under 50 characters" : "",
  },
  {
    name: "lastName", label: "Student Last Name", placeholder: "e.g. Sharma", required: true,
    rule: (v) =>
      !NAME_RE.test(v) ? "Use letters only" :
      v.trim().length < 2 ? "At least 2 characters" :
      v.trim().length > 50 ? "Must be under 50 characters" : "",
  },
  {
    name: "gender", label: "Gender", type: "select", placeholder: "Select Gender",
    options: ["Female", "Male", "Prefer not to say"], required: true,
    rule: (v, f) => (f.options.includes(v) ? "" : "Choose an option from the list"),
  },
  {
    name: "dob", label: "Date of Birth", type: "date", required: true,
    rule: (v) => {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return "Enter a valid date";
      const today = new Date();
      if (d > today) return "Date of birth cannot be in the future";
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      if (age < 2) return "Applicant must be at least 2 years old";
      if (age > 25) return "Please check the year of birth";
      return "";
    },
  },
  {
    name: "religion", label: "Religion", placeholder: "e.g. Hinduism / Christianity / Islam",
    rule: (v) => (!WORDS_RE.test(v) ? "Use letters only" : v.length > 40 ? "Must be under 40 characters" : ""),
  },
  {
    name: "nationality", label: "Nationality", placeholder: "e.g. Indian",
    rule: (v) => (!WORDS_RE.test(v) ? "Use letters only" : v.length > 40 ? "Must be under 40 characters" : ""),
  },
  {
    name: "placeOfBirth", label: "Place of Birth", placeholder: "e.g. Bengaluru",
    rule: (v) => (!WORDS_RE.test(v) ? "Use letters only" : v.length > 60 ? "Must be under 60 characters" : ""),
  },
  {
    name: "lastSchool", label: "Last School Attended", placeholder: "e.g. Sunshine Primary",
    rule: (v) => (v.trim().length < 3 ? "At least 3 characters" : v.length > 100 ? "Must be under 100 characters" : ""),
  },
  {
    name: "residentialAddress", label: "Residential Address", placeholder: "Street Name, Area, City", required: true,
    rule: (v) =>
      v.trim().length < 10 ? "Please give a fuller address (10+ characters)" :
      v.length > 200 ? "Must be under 200 characters" : "",
  },
  {
    name: "currentAddress", label: "Current Address", placeholder: "Temporary or Alternate Address",
    rule: (v) => (v.trim().length < 10 ? "Please give a fuller address (10+ characters)" : v.length > 200 ? "Must be under 200 characters" : ""),
  },
  {
    name: "medium", label: "Medium of Instruction", placeholder: "e.g. English",
    rule: (v) => (!WORDS_RE.test(v) ? "Use letters only" : v.length > 40 ? "Must be under 40 characters" : ""),
  },
  {
    name: "reasonForLeaving", label: "Reason for Leaving Last School", placeholder: "e.g. Relocation / Promotion",
    rule: (v) => (v.trim().length < 3 ? "At least 3 characters" : v.length > 150 ? "Must be under 150 characters" : ""),
  },
  {
    name: "phone", label: "Contact Number", type: "tel", placeholder: "e.g. +91 98765 43210", required: true,
    rule: (v) => {
      const d = v.replace(/\D/g, "");
      if (!/^[\d\s+()-]+$/.test(v)) return "Digits, spaces and + ( ) - only";
      if (d.length < 10) return "Enter at least 10 digits";
      if (d.length > 15) return "That number looks too long";
      return "";
    },
  },
  {
    name: "email", label: "Email ID", type: "email", placeholder: "e.g. parent@email.com", required: true,
    rule: (v) => (!EMAIL_RE.test(v) ? "Enter a valid email address" : v.length > 120 ? "Must be under 120 characters" : ""),
  },
  {
    name: "guardianName", label: "Guardian/Parent Name", placeholder: "Full Name", required: true,
    rule: (v) =>
      !NAME_RE.test(v) ? "Use letters only" :
      v.trim().length < 3 ? "At least 3 characters" :
      v.trim().length > 60 ? "Must be under 60 characters" : "",
  },
  {
    name: "guardianEmail", label: "Guardian Email", type: "email", placeholder: "e.g. guardian@email.com",
    rule: (v) => (!EMAIL_RE.test(v) ? "Enter a valid email address" : ""),
  },
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.name, ""]));

function UploadBox({ label, file, onPick, error }) {
  const ref = useRef(null);
  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={[
          "flex w-full flex-col items-center gap-3 rounded-lg border border-dashed bg-tint p-6 text-center transition-colors hover:border-ink hover:bg-tint",
          error ? "border-red-400" : "border-muted",
        ].join(" ")}
      >
        <span className="text-ink">
          <IconUpload />
        </span>
        <span className="font-poppins text-sm font-bold text-ink">{label}</span>
        <span className="font-arsenal text-xs text-muted">
          {file ? file.name : "Upload PDF, PNG, JPG up to 5MB"}
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <button
          type="button"
          onClick={() => {
            onPick(null);
            if (ref.current) ref.current.value = "";
          }}
          className="self-center font-poppins text-xs font-bold text-brand underline"
        >
          Remove file
        </button>
      ) : null}
      {error ? (
        <p className="text-center font-arsenal text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export default function Admissions() {
  const [values, setValues] = useState(EMPTY);
  const [files, setFiles] = useState({ tc: null, marks: null });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const next = {};

    FIELDS.forEach((f) => {
      const v = values[f.name] ?? "";
      if (!v.trim()) {
        // optional fields are only checked once the user types something
        if (f.required) next[f.name] = "This field is required";
        return;
      }
      const msg = f.rule?.(v.trim(), f);
      if (msg) next[f.name] = msg;
    });

    const checkFile = (key, label) => {
      const file = files[key];
      if (!file) {
        next[key] = `${label} is required`;
        return;
      }
      if (file.size > MAX_FILE) next[key] = "File must be under 5MB";
      else if (!/\.(pdf|png|jpe?g)$/i.test(file.name))
        next[key] = "Only PDF, PNG or JPG files are accepted";
    };
    checkFile("tc", "Transfer certificate");
    checkFile("marks", "Marks card");

    return next;
  };
;

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      const first = document.querySelector(`[name="${Object.keys(next)[0]}"]`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus({ preventScroll: true });
      return;
    }
    setBusy(true);
    const res = await submitAdmission(values, files);
    setBusy(false);

    if (!res.ok) {
      setErrors(
        res.message ? { form: res.message } : toFormFields(res.errors)
      );
      return;
    }
    setSubmitted(true);
    setTimeout(
      () =>
        document
          .getElementById("registration-result")
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      60
    );
  };

  const reset = () => {
    setValues(EMPTY);
    setFiles({ tc: null, marks: null });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <>
      <section className="bg-white py-10 lg:py-20">
        <div className="shell">
          <HeroBanner
            image="/images/hero-admissions.svg"
            badge="Admissions open 2025–26"
            align="center"
            title="Join our Global Learning Community"
            height="min-h-[300px] sm:min-h-[360px] lg:min-h-[420px]"
            text="Nurturing inquisitive minds and building a robust academic foundation. Embark on a dynamic learning path built for the modern world."
          >
            <a href="#registration" className="btn btn-primary mt-2">
              Start your application
            </a>
          </HeroBanner>
        </div>
      </section>

      {/* ------------------------------------------- process + documents */}
      <section className="bg-white pb-12 lg:pb-20">
        <div className="shell grid gap-8 lg:grid-cols-2">
          <Reveal className="flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-6 lg:p-8">
            <h2 className="font-poppins text-xl font-bold">Admission Process</h2>
            <ol className="flex w-full flex-col gap-4">
              {STEPS.map((s) => (
                <li key={s.n} className="flex items-start gap-4">
                  <span className="font-poppins text-lg font-bold text-ink">
                    {s.n}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-poppins text-sm font-bold text-ink">
                      {s.title}
                    </span>
                    <span className="font-arsenal text-[13px] text-muted">
                      {s.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal
            className="flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-6 lg:p-8"
            style={{ transitionDelay: "90ms" }}
          >
            <h2 className="font-poppins text-xl font-bold">Required Documents</h2>
            <p className="font-arsenal text-sm text-muted">
              Please ensure you have scanned copies of these documents ready before
              filling out the registration structure.
            </p>
            <ul className="flex w-full flex-col gap-4">
              {DOCUMENTS.map((d) => (
                <li key={d} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-ink/10 text-ink">
                    <IconCheck />
                  </span>
                  <span className="font-arsenal text-sm text-ink">{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------- registration form */}
      <section id="registration" className="scroll-mt-24 bg-white pb-16 lg:pb-24">
        <div className="shell">
          <div className="framed">
            <form
              noValidate
              onSubmit={onSubmit}
              className="flex flex-col items-start gap-8 rounded-2xl bg-white p-6 sm:p-8 lg:p-10"
            >
              <div className="flex flex-col items-start gap-2">
                <p className="font-poppins text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
                  Online Student Intake
                </p>
                <h2 className="font-poppins text-[26px] font-bold leading-[1.3] sm:text-[32px]">
                  Academic Registration Form
                </h2>
              </div>

              <div className="grid w-full gap-x-6 gap-y-5 md:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.name} className="flex flex-col items-start gap-2">
                    <label htmlFor={f.name} className="field-label">
                      {f.label}
                      {f.required ? <span className="text-brand"> *</span> : null}
                    </label>

                    {f.type === "select" ? (
                      <select
                        id={f.name}
                        name={f.name}
                        value={values[f.name]}
                        onChange={(e) => set(f.name, e.target.value)}
                        className={`field ${errors[f.name] ? "border-red-400" : ""}`}
                      >
                        <option value="">{f.placeholder}</option>
                        {f.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={f.name}
                        name={f.name}
                        type={f.type || "text"}
                        placeholder={f.placeholder}
                        value={values[f.name]}
                        onChange={(e) => set(f.name, e.target.value)}
                        aria-invalid={Boolean(errors[f.name])}
                        className={`field ${errors[f.name] ? "border-red-400" : ""}`}
                      />
                    )}

                    {errors[f.name] ? (
                      <p className="font-arsenal text-xs text-red-600">
                        {errors[f.name]}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex w-full flex-col items-start gap-4 pt-2">
                <p className="font-poppins text-base font-bold text-ink">
                  Document Verification Attachments
                </p>
                <div className="grid w-full gap-6 md:grid-cols-2">
                  <UploadBox
                    label="Transfer Certificate (TC)"
                    file={files.tc}
                    error={errors.tc}
                    onPick={(f) => {
                      setFiles((v) => ({ ...v, tc: f }));
                      setErrors((e) => {
                        const n = { ...e };
                        delete n.tc;
                        return n;
                      });
                    }}
                  />
                  <UploadBox
                    label="Marks Card / Transcripts"
                    file={files.marks}
                    error={errors.marks}
                    onPick={(f) => {
                      setFiles((v) => ({ ...v, marks: f }));
                      setErrors((e) => {
                        const n = { ...e };
                        delete n.marks;
                        return n;
                      });
                    }}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col items-center gap-8 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn btn-primary px-9 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Submitting…" : "Submit Registration Portfolio"}
                  </button>
                  <button type="button" onClick={reset} className="btn btn-outline">
                    Clear form
                  </button>
                </div>

                {errors.form ? (
                  <p
                    role="alert"
                    className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-center font-arsenal text-sm text-red-700"
                  >
                    {errors.form}
                  </p>
                ) : null}

                {submitted ? (
                  <div
                    id="registration-result"
                    role="status"
                    aria-live="polite"
                    className="flex w-full items-center gap-6 self-stretch rounded-2xl border border-ink bg-success p-8"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-ink">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0"
                      >
                        <path
                          d="M16.666 5L7.50023 14.166L3.33398 9.99964"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <div className="flex w-full flex-col items-start gap-1">
                      <p className="w-fit font-poppins text-lg font-bold text-ink">
                        Registration Pre-Approved
                      </p>
                      <p className="w-full font-arsenal text-sm text-body">
                        Your form metadata passes automated initial criteria. Our
                        admissions manager will contact you in 48 hours for the
                        physical document audit.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
