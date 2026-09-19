# Frontend architecture & backend integration guide

> **Status: the backend described here is built and wired.** It lives in
> `../backend` (Django + DRF + Postgres). See `backend/README.md` for running
> and deploying it. This document remains the contract between the two.

---

## 1. What this frontend is

A **static single-page app**. Vite builds it to plain `dist/` (HTML + JS + CSS +
images) — there is no Node server, no SSR, no API routes.

```
Browser ──▶ dist/index.html + bundle        (any static host / CDN)
              │
              └── fetch() ──▶ YOUR BACKEND   (separate origin)
```

All network access goes through one module, `src/api.js`. Every content call
falls back to the copy hardcoded in the page files, so **the site keeps working
if the API is down or `VITE_API_URL` is unset** — useful for previewing the
frontend alone.

So "connecting a backend" means two separate jobs:

| Job | Scope | Required? |
| --- | ----- | --------- |
| **A. Form submissions** | 2 endpoints | **Yes** — the forms are dead without it |
| **B. Content from a CMS** | ~10 endpoints | Optional — only if staff must edit copy |

Do A first. B is a nice-to-have.

---

## 2. Stack & state model

Vite 8 · React 19 · React Router 7 (`BrowserRouter`) · Tailwind v4 · plain JSX.

- **No state library.** 33 `useState`/`useEffect` calls, all local to a
  component. Nothing is shared across routes.
- **No data layer, no cache, no client-side router loaders.**
- **Routing is client-side.** `BrowserRouter` with real paths.

```
src/
  main.jsx        boot; mounts <App/> and removes the HTML boot loader
  App.jsx         <Routes> — 8 pages + 404, wrapped in Navbar/Footer
  data/site.js    school contact details, nav links, footer links, socials
  components/     Navbar, Footer, Icons, common (ScrollToTop, Reveal,
                  CountUp, SectionTitle, DoodleLayer, HeroBanner)
  pages/          one file per route
```

### Deployment constraint

`BrowserRouter` means the host **must rewrite unknown paths to `index.html`**,
or `/about` 404s on refresh.

- Netlify: `_redirects` → `/*  /index.html  200`
- Nginx: `try_files $uri $uri/ /index.html;`
- Vercel: works by default

---

## 3. The two integration points

These are the only two places in the codebase that need a backend.

| # | Frontend call | Endpoint |
| - | ------------- | -------- |
| 1 | `submitAdmission()` in `src/api.js` | `POST /api/admissions/` |
| 2 | `submitEnquiry()` in `src/api.js` | `POST /api/enquiries/` |

Content reads use `useContent(path, fallback)` and `useBrochure()` from the
same module.

Both already run **full client-side validation before** reaching that line, so
your handler receives structurally valid data. Validate again server-side
anyway — client validation is a UX affordance, not a trust boundary.

---

## 4. Endpoint: `POST /api/enquiries` (Contact form)

**Content-Type:** `application/json`

### Request body

| Field | Type | Required | Client-side rule |
| ----- | ---- | -------- | ---------------- |
| `name` | string | yes | non-empty after trim |
| `email` | string | yes | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `phone` | string | no | if present, ≥10 digits after stripping non-digits |
| `subject` | string | yes | one of the 6 enum values below |
| `message` | string | yes | ≥10 chars after trim |

`subject` enum (exact strings, from `SUBJECTS` in `Contact.jsx`):

```
"Admissions & Registration"
"Campus Visit / Tour"
"Fees & Scholarships"
"Transport & Facilities"
"Careers at ICS"
"Something else"
```

```json
{
  "name": "Amit Kumar",
  "email": "amit@example.com",
  "phone": "+91 99000 12345",
  "subject": "Campus Visit / Tour",
  "message": "I would like to book a campus tour next week."
}
```

### Responses

```
201 Created   { "id": "enq_01H..." }
400           { "errors": { "email": "Enter a valid email address" } }
429           { "message": "Too many requests, please try again later." }
500           { "message": "Something went wrong. Please call the office." }
```

---

## 5. Endpoint: `POST /api/admissions` (Registration form)

**Content-Type:** `multipart/form-data` — two files are mandatory.

### Text fields (16, exact `name` attributes)

| Field | Required | Notes |
| ----- | -------- | ----- |
| `firstName` | **yes** | |
| `lastName` | **yes** | |
| `gender` | **yes** | enum: `Female` \| `Male` \| `Prefer not to say` |
| `dob` | **yes** | `<input type="date">` → `YYYY-MM-DD` |
| `religion` | no | |
| `nationality` | no | |
| `placeOfBirth` | no | |
| `lastSchool` | no | |
| `residentialAddress` | **yes** | |
| `currentAddress` | no | |
| `medium` | no | medium of instruction |
| `reasonForLeaving` | no | |
| `phone` | **yes** | ≥10 digits after stripping non-digits |
| `email` | **yes** | email regex |
| `guardianName` | **yes** | |
| `guardianEmail` | no | email regex if present |

### File parts (both mandatory)

| Part | Document | Accept |
| ---- | -------- | ------ |
| `tc` | Transfer Certificate | `.pdf,.png,.jpg,.jpeg` |
| `marks` | Marks Card / Transcripts | `.pdf,.png,.jpg,.jpeg` |

> The 5 MB cap and the extension whitelist are now enforced **both** in
> `validate()` on the client and by the model's `FileExtensionValidator` plus
> `DATA_UPLOAD_MAX_MEMORY_SIZE` on the server.

### Responses

```
201 Created   { "id": "adm_01H...", "reference": "ICS-2026-0142" }
400           { "errors": { "dob": "Student must be at least 3 years old" } }
413           { "message": "File too large. Maximum 5 MB per document." }
415           { "message": "Only PDF, PNG and JPG files are accepted." }
```

---

## 6. Error contract — this is the important bit

Both forms hold errors in a `useState` object **keyed by field name**:

```js
const [errors, setErrors] = useState({});   // { email: "Enter a valid email" }
```

Rendering is already wired: any key present shows red text under that input and
turns its border red. So if your 400 responses use this shape —

```json
{ "errors": { "<fieldName>": "<message shown to the user>" } }
```

— server-side errors render **identically to client-side ones with no extra UI
work**. Keys must match the `name` attributes in §4 / §5 exactly.

Use a separate top-level `message` for non-field errors (500, 429, network
down); that needs a small banner, which doesn't exist yet.

---

## 7. How the frontend is wired

Everything goes through **`src/api.js`**:

| Export | Used by | Behaviour |
| ------ | ------- | --------- |
| `submitEnquiry(values)` | Contact | POSTs JSON |
| `submitAdmission(values, files)` | Admissions | POSTs multipart, maps camelCase → snake_case |
| `useContent(path, fallback)` | Gallery, About, Home | Renders `fallback` instantly, swaps in live data |
| `useBrochure()` | Home | Active brochure URL, falls back to the bundled PDF |
| `toFormFields(errors)` | Admissions | Maps snake_case server keys back to form field names |

Both submits return a normalised `{ ok, errors, message }`, so each form
handles success, field errors and transport failure the same way. Both buttons
disable while in flight and show a red banner for non-field errors.

### Config

`icsw/.env.local`:

```bash
VITE_API_URL=http://127.0.0.1:8000     # blank = run on built-in content only
```

Vite bakes `VITE_*` into the bundle at build time — **they are public**. Never
put secrets there.

---

## 8. Backend requirements

- **CORS** — the SPA is a different origin. Allow your frontend origin for
  `POST`, and `Content-Type` on the enquiry endpoint. No cookies are used, so
  `Access-Control-Allow-Credentials` is not needed.
- **Rate limiting + spam protection.** Both forms are public and unauthenticated.
  There is no CAPTCHA or honeypot today — add one, or expect spam.
- **Virus-scan the uploads.** Strangers upload PDFs/images of children's
  documents.
- **These are minors' records.** Encrypt at rest, restrict access, set a
  retention policy. This is the highest-risk data on the site.
- **Email/notify** the office on each submission — nobody will poll a database.

---

## 9. Optional: content endpoints

Only needed if school staff must edit copy without a developer. Every array
below is currently hardcoded; each would become one `GET`.

| Content | Where it lives now | Suggested endpoint |
| ------- | ------------------ | ------------------ |
| School contact details | `data/site.js` → `SCHOOL` | `GET /api/settings` |
| Footer links, socials | `data/site.js` | `GET /api/settings` |
| Home stats | `Home.jsx` → `STATS` | `GET /api/stats` |
| Home programmes | `Home.jsx` → `PROGRAMS` | `GET /api/programmes` |
| Departments ("Our People") | `About.jsx` → `FACULTY` | `GET /api/faculty` |
| Awards | `About.jsx` → `AWARDS` | `GET /api/awards` |
| Academic stages | `Academics.jsx` → `STAGES` | `GET /api/stages` |
| Facilities | `LifeAtIcs.jsx` → `FACILITIES` | `GET /api/facilities` |
| Gallery photos | `Gallery.jsx` → `PHOTOS` | `GET /api/gallery` |
| Founder chapters | `FounderStory.jsx` → `CHAPTERS` | `GET /api/chapters` |
| Admission steps/documents | `Admissions.jsx` → `STEPS`, `DOCUMENTS` | `GET /api/admissions/info` |

**Gallery is the best candidate** — photos change often and the array already
carries `src`, `title`, `caption`, `cat`, `span`. Serve the same shape and the
component needs no changes beyond the fetch.

If you do this, you'll need loading and error states per page — currently there
are none, because nothing can fail. Consider TanStack Query rather than
hand-rolling `useEffect` fetches.

---

## 10. Before going live

1. Set `CORS_ALLOWED_ORIGINS` on the backend to the real frontend domain
2. Set `PUBLIC_BASE_URL` so uploaded media resolves to absolute URLs
3. Add the Gmail App Password and `NOTIFY_EMAILS`
4. **Move uploads off the Render free tier's ephemeral disk** — attach a Render
   Disk or switch to S3/Cloudinary, or gallery photos and submitted documents
   are wiped on every deploy
5. Add a CAPTCHA or honeypot; the throttle alone will not stop determined spam
