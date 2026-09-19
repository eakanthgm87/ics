# The Indiranagar Cambridge School — website

An 8-page React site for The Indiranagar Cambridge School, Bengaluru, built from
the supplied Figma exports. Shared navbar and footer, responsive down to 390px,
and every button, link and form wired up.

---

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

| Script                 | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Dev server with hot reload on :5173                        |
| `npm run build`        | Production build into `dist/`                              |
| `npm run preview`      | Serve the production build on :4173                        |
| `npm run lint`         | oxlint over `src/` and `scripts/`                          |
| `npm run gen:images`   | Regenerate the placeholder artwork in `public/images/`      |
| `npm run gen:brochure` | Regenerate `public/ICS-Brochure.pdf`                        |

Requires Node 18+ (developed on Node 24).

---

## Tech

Vite 8 · React 19 · React Router 7 (`BrowserRouter`) · Tailwind CSS v4 · oxlint.
Plain JSX — no TypeScript. No backend, no data fetching, no state library.

### Deploying

`BrowserRouter` uses real paths, so **the host must rewrite all unknown routes to
`index.html`** or deep links like `/about` will 404 on refresh.

- Netlify — `_redirects` containing `/*  /index.html  200`
- Vercel — works out of the box
- Nginx — `try_files $uri $uri/ /index.html;`

---

## Pages

| Route            | Page            | Component                 |
| ---------------- | --------------- | ------------------------- |
| `/`              | Home            | `src/pages/Home.jsx`        |
| `/about`         | About Us        | `src/pages/About.jsx`       |
| `/academics`     | Academics       | `src/pages/Academics.jsx`   |
| `/life-at-ics`   | Life at ICS     | `src/pages/LifeAtIcs.jsx`   |
| `/gallery`       | Gallery         | `src/pages/Gallery.jsx`     |
| `/admissions`    | Admissions      | `src/pages/Admissions.jsx`  |
| `/contact`       | Contact         | `src/pages/Contact.jsx`     |
| `/founder-story` | Founder's Story | `src/pages/FounderStory.jsx` |
| anything else    | 404             | `NotFound` in `src/App.jsx`  |

---

## Every link and button

### Navbar — `src/components/Navbar.jsx`

Sticky, gains a shadow on scroll, active route underlined in ochre. Below
1024px it collapses to a hamburger drawer that locks body scroll and closes on
navigation.

| Control      | Goes to        |
| ------------ | -------------- |
| Logo         | `/`            |
| Home         | `/`            |
| About        | `/about`       |
| Academics    | `/academics`   |
| Life at ICS  | `/life-at-ics` |
| Gallery      | `/gallery`     |
| Admissions   | `/admissions`  |
| Contact Us   | `/contact`     |

### Footer — `src/components/Footer.jsx`

| Control                    | Goes to                                          |
| -------------------------- | ------------------------------------------------ |
| Logo                       | `/`                                              |
| Accreditation              | `/about#awards`                                  |
| Affiliation                | `/academics`                                     |
| Parent-Teacher Interaction | `/contact`                                       |
| Safety & Wellbeing         | `/life-at-ics`                                   |
| Child Safety               | `/life-at-ics`                                   |
| Address                    | Google Maps ↗                                    |
| Phone: 080-25215207        | `tel:08025215207`                                |
| Facebook                   | `https://facebook.com/` ↗                        |
| Instagram                  | `https://instagram.com/` ↗                       |
| YouTube                    | `https://youtube.com/` ↗                         |
| LinkedIn                   | `https://linkedin.com/` ↗                        |
| WhatsApp                   | `https://wa.me/919902076777` ↗                   |
| Privacy Policy             | `/contact` — **placeholder, no page yet**        |
| Terms of Service           | `/contact` — **placeholder, no page yet**        |

↗ = opens in a new tab.

### Home — `/`

| Control                    | Action                                            |
| -------------------------- | ------------------------------------------------- |
| Enquire Now (hero + CTA)   | `/admissions#registration`, scrolls to the form   |
| Download Brochure (×2)     | Downloads `/ICS-Brochure.pdf`                     |
| View Curriculum            | `/academics`                                      |
| Learn more (STEM card)     | `/academics`                                      |
| Learn more (Arts card)     | `/life-at-ics`                                    |

**Stat counters** animate once when scrolled into view. Only figures the school
publishes are shown (founded 1979, 7 students in 1979, Nursery–Grade 10, first
Class X batch 1989); the year counters count *down* from the current year.
Respects `prefers-reduced-motion`. See `CountUp` in `src/components/common.jsx`.

### About — `/about`

| Control                          | Action                                     |
| -------------------------------- | ------------------------------------------ |
| Read Our History                 | `/founder-story`                           |
| Department card ×5               | Expands that card and reveals its detail   |
| Previous / Next faculty member   | Steps through the faculty                  |
| Faculty dots ×5                  | Jumps straight to that person              |
| Previous / Next awards           | Pages the awards carousel                  |
| Awards dots                      | Jumps to an awards page                    |

**Our People** does not move on its own. Every card and portrait is a fixed
size and the row has a fixed height, so expanding a card never shifts the page.
← / → also work while the carousel has focus.

**Awards** shows 4 per page on desktop, 3 / 2 / 1 as the screen narrows. All
cards share one identical border — there is no highlighted variant.

### Academics — `/academics`

Static page: an intro block plus four stage sections (Early Years, Primary,
Middle, High), each with a framed image and two sub-cards. No interactive
controls.

### Life at ICS — `/life-at-ics`

Static page: five facility sections (Sports, Laboratories, Library, Reading
Room, Multimedia) with alternating image/text. No interactive controls.

### Gallery — `/gallery`

| Control                                   | Action                                    |
| ----------------------------------------- | ----------------------------------------- |
| Filter tabs: All / Sports / Academics / Events / Campus | Filters the grid            |
| Any photo tile                            | Opens the lightbox                        |

**Lightbox** (1080×640 on desktop) — blurs and dims the page behind it:

| Control            | Action                                      |
| ------------------ | ------------------------------------------- |
| Previous / Next    | Cycles within the current filter            |
| ← / →              | Same, from the keyboard                     |
| Close / `Esc`      | Closes                                      |
| Click the backdrop | Closes                                      |
| Share on Facebook  | Facebook sharer ↗                           |
| Share on WhatsApp  | WhatsApp share ↗                            |
| Copy link          | Copies the gallery URL to the clipboard     |

### Admissions — `/admissions`

| Control                       | Action                                          |
| ----------------------------- | ----------------------------------------------- |
| Start your application        | Scrolls to `#registration`                      |
| Transfer Certificate (TC)     | Opens a file picker, shows the chosen filename  |
| Marks Card / Transcripts      | Opens a file picker, shows the chosen filename  |
| Remove file                   | Clears that upload                              |
| Submit Registration Portfolio | Validates, then reveals the pre-approval panel  |
| Clear form                    | Resets every field, file and error              |

16 fields. Required: first name, last name, gender, date of birth, residential
address, contact number, email, guardian name, **and both uploads**. Email is
format-checked; phone must have at least 10 digits. On failure the page scrolls
to and focuses the first bad field.

### Contact — `/contact`

| Control                     | Action                                          |
| --------------------------- | ----------------------------------------------- |
| 080-25215207                | `tel:08025215207`                               |
| +91 98450 12345             | `tel:+919845012345`                             |
| info@icsbengaluru.edu.in    | `mailto:info@icsbengaluru.edu.in`               |
| Get Directions              | Google Maps ↗                                   |
| The map image               | Google Maps ↗ — a fixed image, not an embed     |
| Submit Message              | Validates, then shows the confirmation          |

Required: name, valid email, subject, and a message of 10+ characters. Phone is
optional but format-checked when filled.

### Founder's Story — `/founder-story`

| Control              | Action              |
| -------------------- | ------------------- |
| Begin the chronicle  | `#chapter-1`        |
| Explore the campus   | `/life-at-ics`      |

Five chapters with `#chapter-1` … `#chapter-5` anchors.

### 404

| Control     | Action     |
| ----------- | ---------- |
| Back to Home| `/`        |
| Contact Us  | `/contact` |

---

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the backend integration guide
(endpoints, payload shapes, error contract).

## ⚠️ The two forms do not send anywhere

Both validate fully and show a success state, but the payload is only logged to
the browser console. **Wire these up before going live:**

- `src/pages/Admissions.jsx` — `console.info("Registration submitted", …)`
- `src/pages/Contact.jsx` — `console.info("Enquiry submitted", …)`

Replace each with a `fetch()` to your backend or form service. File uploads are
held as `File` objects and would need `FormData`.

---

## Brand

### Colour — three colours, per the brand guidelines

| Colour            | Hex       | Token         | Role               |
| ----------------- | --------- | ------------- | ------------------ |
| Deep Forest Green | `#264130` | `ink`         | Primary / brand    |
| Warm Ochre Brown  | `#A37541` | `brand`       | Secondary / accent |
| White             | `#FFFFFF` | —             | Background / text  |

Supporting neutrals, all derived from the above: `body` `#333333` (body copy),
`muted` `#A49C99`, `line` `#E5E5E5`, `tint` `#F1FEF3`, `chip` `#8CA894`,
`success` `#E8F5E9`. Defined in `src/index.css` under `@theme` — use the tokens
(`bg-ink`, `text-brand`, `border-line`) rather than hex literals.

Page backgrounds are white throughout.

### Type

| Role         | Font             | How to apply                    |
| ------------ | ---------------- | ------------------------------- |
| Headings     | Poppins Bold     | `h1`–`h6` get this automatically |
| Sub-headings | Poppins Regular  | `.subhead`                      |
| Body copy    | Arsenal Regular  | `body` default, or `font-arsenal` |

Only those three faces load from Google Fonts (see `index.html`) — keep it that
way, and don't reach for `font-semibold` / `font-medium`.

### Logos

The lockups are **true vector**, extracted from the school's brand deck, so they
stay sharp at any zoom.

| File                             | Used for                    |
| -------------------------------- | --------------------------- |
| `images/logo-block.svg`          | Navbar (green wordmark)     |
| `images/logo-block-footer.svg`   | Footer (white/reverse)      |
| `images/favicon-crest.svg`       | Browser tab — crest only    |

> The reverse logo in the original brand deck is faulty — the torch is missing
> its stem and a stray fragment sits beside the right wreath. `logo-block-footer.svg`
> is therefore derived from the correct primary mark with the green swapped for
> white. Worth reporting to whoever produced the deck.

---

## Images

No photography was supplied, so **everything in `public/images/` except the
logos and the map is generated vector placeholder art** from
`scripts/generate-images.mjs`.

To use real photographs, drop a file with the same name into `public/images/`
and update the extension where it's referenced (or just overwrite the `.svg`).
Keep roughly the same aspect ratio.

| File                    | Used for               | Ratio    |
| ----------------------- | ---------------------- | -------- |
| `hero-campus.svg`       | Home hero              | 1240×560 |
| `hero-gallery.svg`      | Gallery hero           | 1240×380 |
| `hero-life.svg`         | Life at ICS hero       | 1240×340 |
| `hero-admissions.svg`   | Admissions hero        | 1240×420 |
| `hero-contact.svg`      | Contact hero           | 1240×320 |
| `about-hero.svg`        | About hero             | 600×440  |
| `founder.svg`           | Founder portrait       | 480×520  |
| `principal.svg`         | Principal portrait     | 488×608  |
| `faculty-1…5.svg`       | Faculty carousel       | 320×260  |
| `award-1…4.svg`         | Award card headers     | 300×200  |
| `stage-*.svg`           | Academics stages       | 540×380  |
| `facility-*.svg`        | Life at ICS facilities | 620×460  |
| `gal-*.svg`             | Gallery masonry        | varies   |
| `chapter-1…5.svg`       | Founder story chapters | 712×560  |
| `doodle-*.svg`          | Background doodles     | 140×140  |
| `campus-map.jpg`        | Contact map            | 1200×803 |

> `campus-map.jpg` came from the supplied contact design and appears to be a
> styled Google Maps capture. Google normally requires its attribution to stay
> visible on map imagery, and this crop doesn't include it — check before
> publishing.

---

## Verification scripts

`scripts/interactions.mjs` runs **36 checks** across navigation, hero buttons,
both carousels, the gallery filter and lightbox, both forms, the footer links,
the mobile menu and the 404 page. `scripts/shots.mjs` takes full-page
screenshots at 1440px and 390px.

Both need Playwright, which is deliberately **not** a project dependency:

```bash
npm i -D playwright && npx playwright install chromium
npm run build && npm run preview &     # they expect :4173
node scripts/interactions.mjs          # -> "PASS 36"
node scripts/shots.mjs
```

Set `PW_CHROMIUM=/path/to/chromium` to use a browser you already have.

---

## Project layout

```
src/
  main.jsx            BrowserRouter + StrictMode boot
  App.jsx             routes, page shell, 404
  index.css           @theme tokens + .btn/.field/.card/.shell/.framed helpers
  data/site.js        nav links, school contact details, footer links, socials
  components/
    Navbar.jsx        sticky nav + mobile drawer
    Footer.jsx        links, socials, contact block
    Icons.jsx         all inline SVG icons + the filled social set
    common.jsx        ScrollToTop, Reveal, CountUp, SectionTitle,
                      DoodleLayer, HeroBanner
  pages/              one file per route
scripts/
  generate-images.mjs placeholder artwork generator
  generate-brochure.mjs  brochure PDF generator
  interactions.mjs    36-check interaction suite (needs Playwright)
  shots.mjs           screenshot script (needs Playwright)
```

Content lives in `const` arrays at the top of each page file, not in
`data/site.js` — so a copy change means editing that page.

---

## Known gaps

- Both forms only log to the console (see above).
- Privacy Policy and Terms of Service point at `/contact`; no pages exist.
- Social links point at the bare networks — the school's live site has no real
  profile URLs either.
- Office hours in `data/site.js` are **not published anywhere** and remain a
  guess; confirm them.
- "Our People" describes departments, not individuals — the school publishes no
  staff names or photographs. Swap in real people when supplied.
- Gallery captions are invented; the school's own gallery has no captions.

## Source of truth

Factual content (founder, principal, vision, mission, awards, contact details,
curriculum, facilities) was taken from the school's live site,
<https://www.indiranagarcambridgeschool.com/>, on 2026-09-19. Re-check against
that site before launch.
