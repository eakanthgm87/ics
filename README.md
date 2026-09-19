# The Indiranagar Cambridge School — website

Full-stack website for [The Indiranagar Cambridge School](https://www.indiranagarcambridgeschool.com/),
Bengaluru — a co-educational school founded in 1979, teaching Nursery to
Grade 10 under the Karnataka State Education Board.

An 8-page React site, a Django API, and an admin panel that lets school staff
edit the gallery, faculty, awards, statistics and brochure without a developer.

```
icsw/        React + Vite frontend      → Vercel
backend/     Django + DRF + Postgres    → Render
```

The two halves are independent. The frontend falls back to built-in content
whenever the API is unreachable, so it renders correctly even with the backend
switched off.

---

## Quick start

Two terminals. Backend first.

### Backend — http://127.0.0.1:8000

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows
# source venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
cp .env.example .env             # works as-is for local development
python manage.py migrate
python manage.py seed            # loads the site's real content
python manage.py createsuperuser
python manage.py runserver
```

### Frontend — http://localhost:5173

```bash
cd icsw
npm install
echo VITE_API_URL=http://127.0.0.1:8000 > .env.local
npm run dev
```

Requires **Node 18+** and **Python 3.10+**. Without `.env.local` the site still
runs — it just uses its built-in content instead of the database.

---

## The site

| Route | Page |
| ----- | ---- |
| `/` | Home — hero, animated stat counters, programmes |
| `/about` | Founder, principal, departments, vision & mission, awards |
| `/academics` | Four stages, Nursery to Grade 10 |
| `/life-at-ics` | Facilities — sports, labs, library, multimedia |
| `/gallery` | Filterable masonry collage with a lightbox |
| `/admissions` | 16-field registration form with two document uploads |
| `/contact` | Enquiry form, directory, campus map |
| `/founder-story` | Five chapters of school history |

Design tokens, typography rules and the full link/button inventory are in
[icsw/README.md](icsw/README.md).

---

## The admin panel

`http://127.0.0.1:8000/admin/` — built for non-technical staff. Every field is
grouped and carries plain-English help text.

| Section | Controls |
| ------- | -------- |
| **Gallery images** | Photo, title, caption, category, tile size, order |
| **People** | Portrait, name, role, department, qualification, bio |
| **Stats** | The counter tiles under the homepage hero |
| **Awards** | Year, title, awarding body, artwork |
| **Brochures** | The PDF behind every "Download Brochure" button |
| **Site settings** | Address, phone, email, office hours, social links |
| **Enquiries** | Contact submissions — mark handled, add notes |
| **Admissions** | Registrations — download documents, set status |

Enquiries and Admissions are read-only apart from status and notes: only the
website creates them.

---

## API

| Method | Path | Purpose |
| ------ | ---- | ------- |
| POST | `/api/enquiries/` | Contact form (JSON) |
| POST | `/api/admissions/` | Registration form (multipart, 2 files) |
| GET | `/api/gallery/` `/api/people/` `/api/stats/` `/api/awards/` | Content |
| GET | `/api/brochure/` `/api/settings/` `/api/health/` | Brochure, settings, probe |

Validation errors return **400** with field-keyed messages that the React forms
render directly:

```json
{ "errors": { "email": "Enter a valid email address" } }
```

Both write endpoints are rate-limited (default 10/hour per IP). The full
contract is in [icsw/ARCHITECTURE.md](icsw/ARCHITECTURE.md).

---

## Form notifications

When someone submits a form, the office is notified by **email** (Gmail SMTP)
and optionally **WhatsApp** (CallMeBot). Both are free, and both are
best-effort — if they fail the submission is still saved, because the database
is the system of record.

Setup steps are in [backend/README.md](backend/README.md). To verify email
without filling in the form:

```bash
python manage.py check_email
```

It reports exactly which setting is wrong rather than a raw SMTP traceback.

---

## Deploying

### Backend → Render

`backend/render.yaml` provisions Postgres and the web service together. Push to
GitHub, then Render → **New → Blueprint**. `DATABASE_URL` is injected
automatically, so nothing in the code changes between SQLite and Postgres.

After the first deploy, set in the dashboard:

| Variable | Value |
| -------- | ----- |
| `PUBLIC_BASE_URL` | `https://your-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` / `NOTIFY_EMAILS` | Gmail + App Password |

### Frontend → Vercel

Import the repo, set **root directory** to `icsw`. `vercel.json` handles the
SPA rewrite. Add `VITE_API_URL` pointing at the Render backend.

> ⚠️ **Render's free tier has an ephemeral disk.** Uploaded gallery photos and
> submitted student documents are wiped on every deploy. Before going live,
> attach a Render Disk or move storage to S3/Cloudinary. Database rows are
> unaffected.

---

## Testing

```bash
cd icsw
npm i -D playwright && npx playwright install chromium
npm run build && npm run preview &
node scripts/interactions.mjs      # → PASS 36
```

36 checks across navigation, both carousels, the gallery filter and lightbox,
both forms' validation and submission, footer links, the mobile menu and the
404 page.

---

## Notable decisions

- **No Pillow.** Every upload uses `FileField` + `FileExtensionValidator`;
  `ImageField` would pull in Pillow purely to read image dimensions, which
  nothing here needs.
- **No state library on the frontend.** Every `useState` is local to its
  component; nothing is shared across routes.
- **Logos are true vector**, extracted from the school's brand deck, so they
  stay sharp at any zoom. The reverse (footer) mark is derived from the primary
  one because the deck's own reverse artwork has a broken torch.
- **Placeholder artwork.** No photography was supplied, so `icsw/public/images/`
  is generated vector art from `scripts/generate-images.mjs`. Replace it by
  uploading real photos in the admin.

## Known gaps

- Privacy Policy and Terms of Service link to `/contact`; no pages exist yet.
- Social links point at bare networks — the school's live site has no real
  profile URLs either.
- Office hours are not published anywhere official and remain a best guess.
- Gallery captions are written copy; the school's own gallery has none.
- No CAPTCHA on either public form. The rate limit alone will not stop
  determined spam.

---

## Documentation

| File | Contents |
| ---- | -------- |
| [icsw/README.md](icsw/README.md) | Frontend: pages, every link and button, palette, typography |
| [icsw/ARCHITECTURE.md](icsw/ARCHITECTURE.md) | Frontend ↔ backend contract, payloads, error shape |
| [backend/README.md](backend/README.md) | API, admin, notification setup, Render deploy |
