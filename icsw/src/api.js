/**
 * Backend wiring.
 *
 * Every content call falls back to the copy hardcoded in the page files, so
 * the site keeps rendering if the API is down, slow, or not deployed yet.
 * That means the frontend can ship before the backend does.
 *
 * Set VITE_API_URL in .env (see .env.example). Leaving it blank disables all
 * network calls and the site runs purely on its built-in content.
 */

import { useEffect, useState } from "react";
import CONTENT from "./data/content.json";
import { SCHOOL, SOCIALS } from "./data/site";

export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/** Are we wired to a backend at all? */
export const hasApi = Boolean(API_URL);

/* ------------------------------------------------------------------ reads */

/* one request per path per page load, shared by every component asking */
const cache = new Map();

function getJSON(path) {
  if (!cache.has(path)) {
    const req = fetch(`${API_URL}/api${path}`).then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json();
    });
    req.catch(() => cache.delete(path)); // let a later mount retry
    cache.set(path, req);
  }
  return cache.get(path);
}

/**
 * Returns `fallback` immediately, then swaps in live data once it arrives.
 * No loading spinner is needed because there is always something to render.
 */
export function useContent(path, fallback) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    if (!hasApi) return;
    let live = true;
    getJSON(path)
      .then((rows) => {
        // only replace the built-in copy if the backend actually has content
        if (live && (Array.isArray(rows) ? rows.length : rows)) setData(rows);
      })
      .catch((err) => {
        console.warn(`Falling back to built-in content for ${path}:`, err.message);
      });
    return () => {
      live = false;
    };
  }, [path]);

  return data;
}

/**
 * One block of page copy from /admin → "Page text & images", e.g.
 * useSection("home-hero") → { eyebrow, title, subtitle, body, quote, img }.
 * Any field left blank in the admin keeps the built-in text.
 */
export function useSection(key) {
  return useSections([key])[0];
}

/** Several sections at once, in the order given. */
export function useSections(keys) {
  const all = useContent("/sections/", CONTENT.sections);
  return keys.map((key) => {
    const out = { ...CONTENT.sections[key] };
    for (const [k, v] of Object.entries(all[key] ?? {})) if (v) out[k] = v;
    // "{year}" in any field becomes the current academic year, e.g. 2026-27
    for (const [k, v] of Object.entries(out)) {
      if (typeof v === "string") out[k] = v.replaceAll("{year}", ACADEMIC_YEAR);
    }
    return out;
  });
}

const Y = new Date().getFullYear();
export const ACADEMIC_YEAR = `${Y}-${String((Y + 1) % 100).padStart(2, "0")}`;

/** Contact details + social links from /admin → Site settings. */
export function useSchool() {
  const s = useContent("/settings/", null);
  if (!s) return { ...SCHOOL, socials: SOCIALS };
  return {
    name: s.name,
    address: s.address,
    phone: s.phone,
    mobile: s.mobile,
    email: s.email,
    emailHr: s.email_hr,
    hoursWeek: s.hours_week,
    hoursSat: s.hours_sat,
    mapsUrl: s.maps_url,
    socials: s.socials,
  };
}

/** Split admin text on blank lines into paragraphs. */
export const paragraphs = (text = "") =>
  text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/**
 * The active brochure's URL, falling back to the PDF shipped in public/.
 * Admin uploads a new one and every "Download Brochure" button follows it.
 */
export function useBrochure(fallback = "/ICS-Brochure.pdf") {
  const [url, setUrl] = useState(fallback);

  useEffect(() => {
    if (!hasApi) return;
    getJSON("/brochure/")
      .then((b) => b?.url && setUrl(b.url))
      .catch(() => {
        /* none uploaded yet — the bundled PDF stands in */
      });
  }, [fallback]);

  return url;
}

/* ----------------------------------------------------------------- writes */

/**
 * Normalises every outcome into { ok, errors, message } so both forms can
 * handle success, field errors and transport failures the same way.
 * `errors` is keyed by field name, matching each form's `errors` state.
 */
async function submit(path, init) {
  if (!hasApi) {
    // No backend configured — surface it rather than pretending it worked.
    return {
      ok: false,
      errors: {},
      message:
        "This form is not connected yet. Please call the school office on 080-25215207.",
    };
  }
  try {
    const res = await fetch(`${API_URL}/api${path}`, init);

    if (res.ok) return { ok: true, errors: {}, message: "" };

    if (res.status === 429) {
      return {
        ok: false,
        errors: {},
        message: "Too many submissions. Please try again later.",
      };
    }

    let body = {};
    try {
      body = await res.json();
    } catch {
      /* non-JSON error page */
    }
    return {
      ok: false,
      errors: body.errors ?? {},
      message: body.errors
        ? ""
        : body.message || "Something went wrong. Please try again.",
    };
  } catch {
    return {
      ok: false,
      errors: {},
      message: "Could not reach the server. Check your connection and try again.",
    };
  }
}

/** Contact form → POST /api/enquiries/ */
export function submitEnquiry(values) {
  return submit("/enquiries/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

/**
 * Registration form → POST /api/admissions/
 * Sent as multipart because of the two document uploads. Content-Type is
 * deliberately not set: the browser adds it with the correct boundary.
 */
export function submitAdmission(values, files) {
  const body = new FormData();
  const map = {
    firstName: "first_name",
    lastName: "last_name",
    placeOfBirth: "place_of_birth",
    lastSchool: "last_school",
    reasonForLeaving: "reason_for_leaving",
    residentialAddress: "residential_address",
    currentAddress: "current_address",
    guardianName: "guardian_name",
    guardianEmail: "guardian_email",
  };
  Object.entries(values).forEach(([k, v]) => {
    if (v !== "" && v != null) body.append(map[k] ?? k, v);
  });
  body.append("tc", files.tc);
  body.append("marks", files.marks);

  return submit("/admissions/", { method: "POST", body });
}

/** Backend field names come back snake_case — map them to the form's keys. */
export function toFormFields(errors) {
  const back = {
    first_name: "firstName",
    last_name: "lastName",
    place_of_birth: "placeOfBirth",
    last_school: "lastSchool",
    reason_for_leaving: "reasonForLeaving",
    residential_address: "residentialAddress",
    current_address: "currentAddress",
    guardian_name: "guardianName",
    guardian_email: "guardianEmail",
  };
  return Object.fromEntries(
    Object.entries(errors).map(([k, v]) => [back[k] ?? k, v])
  );
}
