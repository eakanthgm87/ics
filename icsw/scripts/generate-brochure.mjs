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
const head = (t, size = 13, gap = 14) => [[t, "B", size, gap]];
const gap = (n = 8) => [["", "R", 11, n]];
/** wrap a paragraph to the page width (Helvetica 11pt ~ 86 chars a line) */
const para = (text, font = "R", width = 86) => {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > width) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  lines.push(line);
  return lines.map((l, i) => [l, font, 11, i ? 4 : 10]);
};
const bullets = (items) => items.map((t, i) => [`- ${t}`, "R", 11, i ? 4 : 10]);

const PAGES = [
  [
    ["THE INDIRANAGAR CAMBRIDGE SCHOOL", "B", 20, 0],
    ["Bengaluru - Established 1979 - Motto: Towards Perfection", "R", 12, 10],
    ...gap(),
    ...head("Nurturing Minds Since 1979", 16, 10),
    ...para(
      "A co-educational school offering Nursery through Grade 10 under the Karnataka State " +
        "Education Board, with English as the medium of instruction. What began in 1979 with " +
        "7 students and 2 teachers in Thippasandra moved to its HAL 3rd Stage campus in 1986 " +
        "and produced its first Class X batch in 1989."
    ),
    ...head("OUR VISION"),
    ...para("To nurture confident, compassionate and responsible learners for a better future."),
    ...head("OUR MISSION"),
    ...para(
      "To provide a safe, happy and disciplined environment where every child learns, " +
        "explores, develops skills and grows into a responsible individual."
    ),
    ...head("OUR FACULTY"),
    ...para(
      "Our teachers are at the heart of our school. With dedication, care and a strong sense " +
        "of responsibility, they guide every child to learn, grow and become confident " +
        "individuals, bringing knowledge, values and individual attention together."
    ),
    ...para("Dedicated Teachers. Caring Mentors. Inspiring Learners.", "B"),
    ...head("AWARDS & HONOURS"),
    ...para(
      "Every achievement reflects the dedication of our students, teachers and school " +
        "community - in academics, co-curricular activities, sports, leadership and service."
    ),
    ...bullets([
      "India Top School Awards 2026 - Sustainable & Holistic Growth Programs",
      "Indian Talent Olympiad 2025-26 - Golden School and Best Principal Award",
      "JB Nagar Cluster Sports - prizes in 2016-17, 2022-23 and 2024-25",
      "Address School Health Awards Winner 2019-20; Health Hall of Fame 2018",
    ]),
  ],
  [
    ["LIFE AT ICS", "B", 18, 0],
    ...head("Academic Pathway", 13, 12),
    ...bullets([
      "Early Years Foundation - play-based cognitive, sensory and motor development",
      "Primary Academy (Grades 1-4) - inquiry-led learning and strong literacy",
      "Middle School (Grades 5-7) - laboratory sciences and civic leadership",
      "High School (Grades 8-10) - board-exam preparation and career counselling",
    ]),
    ...head("Learning Through Discovery"),
    ...para(
      "Our laboratories let students move beyond textbooks through observation, " +
        "experimentation and practical activities, building curiosity, scientific thinking " +
        "and problem-solving skills."
    ),
    ...para("Explore. Experiment. Discover. Learn.", "B"),
    ...head("Our Library"),
    ...para(
      "A welcoming space where children discover the joy of reading, explore new ideas and " +
        "develop the habit of learning beyond the classroom - one page at a time."
    ),
    ...para("Read. Explore. Imagine. Grow.", "B"),
    ...head("Sports & Physical Development"),
    ...para(
      "Regular physical activities, games and sports events - including the annual Swift " +
        "inter-house meet - help children build fitness, confidence, resilience, teamwork " +
        "and a healthy competitive spirit."
    ),
    ...para("Play. Participate. Persevere. Excel.", "B"),
  ],
  [
    ["ADMISSIONS", "B", 18, 0],
    ...head("The five-step process", 13, 12),
    ...bullets([
      "Enquiry - submit an online enquiry or visit the campus office.",
      "Campus visit - meet our academic counsellors and explore the facilities.",
      "Application - fill out the registration form with academic history.",
      "Document verification - transfer certificate, marks card and photo proof.",
      "Enrollment - secure the seat by paying the fees upon evaluation.",
    ]),
    ...head("Documents required"),
    ...bullets([
      "Birth certificate",
      "Transfer certificate (TC) from the previous school",
      "Previous year marks card / transcripts",
      "Recent passport-sized photographs of the student",
      "Address proof of parent / guardian",
    ]),
    ...head("CONTACT", 13, 18),
    ["#52, 6th Cross, 8th Main Rd, HAL 3rd Stage, Bengaluru 560075", "R", 11, 12],
    ...gap(4),
    ["Main office      080-25215207", "R", 11, 6],
    ["Admissions       +91 99020 76777", "R", 11, 4],
    ["Email            indiranagarcambridgeschool@gmail.com", "R", 11, 4],
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
    "The Indiranagar Cambridge School - Bengaluru - Towards Perfection"
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
