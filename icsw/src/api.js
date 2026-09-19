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

export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/** Are we wired to a backend at all? */
export const hasApi = Boolean(API_URL);

/* ------------------------------------------------------------------ reads */

async function getJSON(path, { signal } = {}) {
  const res = await fetch(`${API_URL}/api${path}`, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Returns `fallback` immediately, then swaps in live data once it arrives.
 * No loading spinner is needed because there is always something to render.
 */
export function useContent(path, fallback) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    if (!hasApi) return;
    const ac = new AbortController();
    getJSON(path, { signal: ac.signal })
      .then((rows) => {
        // only replace the built-in copy if the backend actually has content
        if (Array.isArray(rows) ? rows.length : rows) setData(rows);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn(`Falling back to built-in content for ${path}:`, err.message);
        }
      });
    return () => ac.abort();
  }, [path]);

  return data;
}

/**
 * The active brochure's URL, falling back to the PDF shipped in public/.
 * Admin uploads a new one and every "Download Brochure" button follows it.
 */
export function useBrochure(fallback = "/ICS-Brochure.pdf") {
  const [url, setUrl] = useState(fallback);

  useEffect(() => {
    if (!hasApi) return;
    const ac = new AbortController();
    getJSON("/brochure/", { signal: ac.signal })
      .then((b) => b?.url && setUrl(b.url))
      .catch(() => {
        /* none uploaded yet — the bundled PDF stands in */
      });
    return () => ac.abort();
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
