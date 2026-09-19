# ICS backend — Django + DRF

API and admin panel for the Indiranagar Cambridge School website.
The React frontend lives in `../icsw` and is deployed separately.

```
icsw/          ← frontend (React + Vite)   → Vercel
backend/       ← this project (Django)      → Render
```

---

## Run it locally

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
copy .env.example .env         # then edit it
python manage.py migrate
python manage.py seed          # loads the site's current content
python manage.py createsuperuser
python manage.py runserver
```

- API — <http://127.0.0.1:8000/api/>
- Admin — <http://127.0.0.1:8000/admin/>

Then point the frontend at it: put `VITE_API_URL=http://127.0.0.1:8000` in
`icsw/.env.local` and run `npm run dev`.

> **Windows note.** If `pip install psycopg[binary]` has no matching wheel for
> your Python, install plain `psycopg` and put the PostgreSQL `bin` folder
> (which contains `libpq.dll`) on your PATH. Render is unaffected.

---

## Endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| POST | `/api/enquiries/` | Contact form. JSON. |
| POST | `/api/admissions/` | Registration form. **multipart/form-data** (2 files). |
| GET | `/api/gallery/` | Gallery photos |
| GET | `/api/people/` | "Our People" cards |
| GET | `/api/stats/` | Homepage counter tiles |
| GET | `/api/awards/` | Awards & Honors |
| GET | `/api/brochure/` | Active brochure (404 if none uploaded) |
| GET | `/api/settings/` | Address, phone, email, socials |
| GET | `/api/health/` | Uptime probe |

### Error shape

Validation failures return **400** with field-keyed messages that the React
forms render directly, with no mapping:

```json
{ "errors": { "email": "Enter a valid email address" } }
```

Rate limiting returns **429**. Both write endpoints are capped at
`THROTTLE_FORMS` (default 10/hour per IP).

---

## What staff can edit in `/admin`

| Section | What it controls |
| ------- | ---------------- |
| **Gallery images** | Photo, title, caption, category, tile size, order |
| **People** | Portrait, name, role, department, qualification, bio |
| **Stats** | The counter tiles under the homepage hero |
| **Awards** | Year, title, awarding body, image |
| **Brochures** | The PDF behind every "Download Brochure" button |
| **Site settings** | Address, phone, email, office hours, social links |
| **Enquiries** | Read contact submissions, mark handled, add notes |
| **Admissions** | Read registrations, download documents, set status |

Enquiries and Admissions are read-only apart from status/notes — only the
website creates them.

---

## Notifications

Both are **best-effort**: if they fail, the submission is still saved and the
form still succeeds. The database is the system of record.

### Email (free — Gmail SMTP)

1. Enable 2-Step Verification on the Google account
2. Create an App Password at <https://myaccount.google.com/apppasswords>
3. Set `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (the 16-character App
   Password — *not* the account password) and `NOTIFY_EMAILS`
4. Set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`

Left unset, email prints to the console — handy in development.

> Gmail SMTP allows roughly 500 messages/day, far above this site's volume.

### WhatsApp (free — CallMeBot)

1. Save **+34 621 331 709** as a contact
2. WhatsApp it: `I allow callmebot to send me messages`
3. It replies with your API key
4. Set `WHATSAPP_ENABLED=True`, `WHATSAPP_PHONE`, `WHATSAPP_APIKEY`

CallMeBot only sends to the number that granted permission — it's for
notifying the office, not for replying to parents. For two-way messaging
you'd need the paid WhatsApp Business API.

---

## Deploy to Render

`render.yaml` provisions Postgres + the web service in one go.

1. Push this repo to GitHub
2. Render → **New → Blueprint** → pick the repo
3. After the first deploy, set these in the dashboard:

| Variable | Value |
| -------- | ----- |
| `PUBLIC_BASE_URL` | `https://ics-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | Gmail + App Password |
| `NOTIFY_EMAILS` | who receives submissions |
| `WHATSAPP_ENABLED` / `WHATSAPP_PHONE` / `WHATSAPP_APIKEY` | optional |

4. Create the admin user from the Render shell:
   `python manage.py createsuperuser`
5. Optionally `python manage.py seed` to load the starting content

`DATABASE_URL` is injected automatically — no code change is needed to move
from SQLite to Postgres.

> **Uploads on Render's free tier are ephemeral.** The disk is wiped on every
> deploy, so gallery photos and submitted documents will vanish. Before going
> live, either attach a Render Disk or switch storage to S3/Cloudinary via
> `django-storages`. The database rows survive either way.

---

## Files

```
config/settings.py     all configuration, via environment variables
api/models.py          8 models — 2 submissions, 6 content
api/serializers.py     emits the exact key names the React components use
api/views.py           2 throttled writes, 6 reads
api/admin.py           the admin panel staff actually use
api/notifications.py   email + WhatsApp, both fail-safe
api/management/commands/seed.py   loads the site's current content
check_db.py            quick DB inspection
test_notify.py         exercises both notification paths
```
