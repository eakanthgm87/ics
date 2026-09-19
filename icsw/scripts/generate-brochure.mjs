/**
 * Writes public/ICS-Brochure.pdf so the "Download Brochure" buttons deliver a
 * real file. Plain PDF 1.4, Helvetica only — no dependencies.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "ICS-Brochure.pdf");

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

/** [text, font, size, leadingBefore] */
const PAGES = [
  [
    ["THE INDIRANAGAR CAMBRIDGE SCHOOL", "B", 20, 0],
    ["Bengaluru - Established 1979", "R", 12, 10],
    ["", "R", 12, 8],
    ["Nurturing Minds Since 1979", "B", 16, 10],
    [
      "A co-educational institution offering Nursery through Grade 10 under the",
      "R", 11, 14,
    ],
    [
      "Karnataka State Education Board, where academic excellence meets holistic",
      "R", 11, 4,
    ],
    ["development.", "R", 11, 4],
    ["", "R", 11, 10],
    ["AT A GLANCE", "B", 13, 14],
    ["Founded ................ 1979", "R", 11, 12],
    ["Students ............... 1200+", "R", 11, 4],
    ["Expert faculty ......... 80+", "R", 11, 4],
    ["Campuses ............... 3", "R", 11, 4],
    ["Medium of instruction .. English", "R", 11, 4],
    ["Board .................. Karnataka State (KSEEB)", "R", 11, 4],
    ["", "R", 11, 10],
    ["OUR VISION", "B", 13, 14],
    [
      "To nurture young minds into passionate global citizens equipped with robust",
      "R", 11, 12,
    ],
    [
      "ethical values, fearless critical thinking, and creative excellence.",
      "R", 11, 4,
    ],
    ["", "R", 11, 10],
    ["OUR MISSION", "B", 13, 14],
    [
      "World-class education powered by innovative pedagogy, holistic development,",
      "R", 11, 12,
    ],
    [
      "and a protective, nurturing environment that celebrates human diversity.",
      "R", 11, 4,
    ],
  ],
  [
    ["ACADEMIC PATHWAY", "B", 18, 0],
    ["", "R", 11, 6],
    ["Early Years Foundation (Pre-K - Kindergarten)", "B", 12, 12],
    [
      "Play-based learning across cognitive, sensory and motor development, with",
      "R", 11, 10,
    ],
    ["thematic story-circles, outdoor games and sensory play modules.", "R", 11, 4],
    ["", "R", 11, 8],
    ["Primary Academy (Grades 1 - 4)", "B", 12, 10],
    [
      "Inquiry-led pathway building core literacy, bilingual immersion, introductory",
      "R", 11, 10,
    ],
    ["robotics and critical text analysis.", "R", 11, 4],
    ["", "R", 11, 8],
    ["Middle School (Grades 5 - 7)", "B", 12, 10],
    [
      "Formal physics, chemistry and biology laboratories, mathematical olympiads,",
      "R", 11, 10,
    ],
    ["civic leadership and youth parliament sessions.", "R", 11, 4],
    ["", "R", 11, 8],
    ["High School (Grades 8 - 10)", "B", 12, 10],
    [
      "Board-exam alignment with continuous mocks, personalised feedback loops and",
      "R", 11, 10,
    ],
    ["career counselling for higher secondary admissions.", "R", 11, 4],
    ["", "R", 11, 12],
    ["CAMPUS FACILITIES", "B", 13, 12],
    ["- FIFA-standard athletic field, synthetic tracks and indoor courts", "R", 11, 12],
    ["- Separate Physics, Chemistry and Biology laboratories", "R", 11, 4],
    ["- Central library with 35,000+ volumes and digital catalogues", "R", 11, 4],
    ["- Acoustic reading rooms for independent study", "R", 11, 4],
    ["- Multimedia centre with graphics workstations and edit suites", "R", 11, 4],
  ],
  [
    ["ADMISSIONS 2025-26", "B", 18, 0],
    ["", "R", 11, 6],
    ["The five-step process", "B", 13, 12],
    ["1. Enquiry - submit an online enquiry or visit the campus office.", "R", 11, 12],
    ["2. Campus visit - meet our counsellors and explore the facilities.", "R", 11, 5],
    ["3. Application - complete the registration dossier with academic history.", "R", 11, 5],
    ["4. Document verification - transfer credentials, transcripts, photo proof.", "R", 11, 5],
    ["5. Enrollment - secure the seat by paying structural fees on evaluation.", "R", 11, 5],
    ["", "R", 11, 10],
    ["Documents required", "B", 13, 12],
    ["- Government issued birth certificate", "R", 11, 12],
    ["- Official transfer certificate (TC) from the previous school", "R", 11, 4],
    ["- Previous year academic marks card / transcripts", "R", 11, 4],
    ["- Recent passport-sized photographs of the student", "R", 11, 4],
    ["- Address proof of parent / guardian", "R", 11, 4],
    ["", "R", 11, 14],
    ["CONTACT", "B", 13, 12],
    ["#52, 6th Cross, 8th Main Road, HAL 3rd Stage,", "R", 11, 12],
    ["Bengaluru, Karnataka 560075, India", "R", 11, 4],
    ["", "R", 11, 6],
    ["Main office      080-25215207", "R", 11, 6],
    ["Admissions       +91 98450 12345", "R", 11, 4],
    ["Email            info@icsbengaluru.edu.in", "R", 11, 4],
    ["Office hours     Mon-Fri 8:30 AM - 4:00 PM, Sat 9:00 AM - 12:30 PM", "R", 11, 4],
  ],
];

const W = 595.28;
const H = 841.89;

const contentFor = (lines) => {
  let y = H - 72;
  let out = "0.15 0.25 0.19 rg\n";
  out += `0.64 0.46 0.25 rg\n60 ${H - 52} ${W - 120} 6 re f\n0.15 0.25 0.19 rg\n`;
  for (const [text, font, size, gap] of lines) {
    y -= gap + size;
    if (!text) continue;
    out += `BT /F${font === "B" ? "2" : "1"} ${size} Tf 60 ${y.toFixed(2)} Td (${esc(text)}) Tj ET\n`;
  }
  out += `0.64 0.46 0.25 rg\n60 48 ${W - 120} 3 re f\n`;
  out += `0.45 0.45 0.45 rg\nBT /F1 9 Tf 60 32 Td (${esc(
    "Indiranagar Cambridge School - Bengaluru - www.icsbengaluru.edu.in"
  )}) Tj ET\n`;
  return out;
};

/* ------------------------------------------------------------- assemble */
const objects = [];
const push = (body) => objects.push(body) && objects.length;

const pageIds = [];
const contentIds = [];
PAGES.forEach(() => {
  pageIds.push(0);
  contentIds.push(0);
});

// 1 catalog, 2 pages, 3 font R, 4 font B, then per page: content + page
const catalogId = 1;
const pagesId = 2;
const fontRId = 3;
const fontBId = 4;
let next = 5;
PAGES.forEach((_, i) => {
  contentIds[i] = next++;
  pageIds[i] = next++;
});

objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
objects[pagesId - 1] = `<< /Type /Pages /Count ${PAGES.length} /Kids [${pageIds
  .map((id) => `${id} 0 R`)
  .join(" ")}] >>`;
objects[fontRId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
objects[fontBId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

PAGES.forEach((lines, i) => {
  const stream = contentFor(lines);
  objects[contentIds[i] - 1] = `<< /Length ${Buffer.byteLength(
    stream
  )} >>\nstream\n${stream}endstream`;
  objects[pageIds[i] - 1] =
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] ` +
    `/Resources << /Font << /F1 ${fontRId} 0 R /F2 ${fontBId} 0 R >> >> ` +
    `/Contents ${contentIds[i]} 0 R >>`;
});

let pdf = "%PDF-1.4\n";
const offsets = [0];
objects.forEach((body, i) => {
  offsets[i + 1] = Buffer.byteLength(pdf);
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let i = 1; i <= objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info << /Title (Indiranagar Cambridge School - Prospectus) /Producer (ICS Website) >> >>\nstartxref\n${xref}\n%%EOF\n`;

writeFileSync(OUT, pdf, "latin1");
console.log(`brochure written (${PAGES.length} pages)`);
