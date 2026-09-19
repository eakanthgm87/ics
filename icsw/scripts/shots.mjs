import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = process.argv[2] || "/tmp/shots";
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["home", "/"],
  ["about", "/about"],
  ["academics", "/academics"],
  ["life", "/life-at-ics"],
  ["gallery", "/gallery"],
  ["admissions", "/admissions"],
  ["contact", "/contact"],
  ["founder", "/founder-story"],
];

const base = "http://localhost:4173";
const browser = await chromium.launch(
  // honour PW_CHROMIUM if set, otherwise use Playwright's bundled browser
  process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}
);
const errors = [];

for (const [name, path] of ROUTES) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce", // freezes the scroll-reveal so full-page shots are complete
  });
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${name}: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("requestfailed", (r) => errors.push(`${name}: FAILED ${r.url()}`));

  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const t = setInterval(() => {
        window.scrollTo(0, (y += 700));
        if (y > document.body.scrollHeight) {
          clearInterval(t);
          window.scrollTo(0, 0);
          setTimeout(res, 400);
        }
      }, 60);
    });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });

  // horizontal overflow check
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 2) errors.push(`${name}: horizontal overflow ${overflow}px`);

  // mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const overflowM = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflowM > 2) errors.push(`${name}: MOBILE horizontal overflow ${overflowM}px`);
  await page.screenshot({ path: `${OUT}/${name}-mobile.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log(errors.length ? errors.join("\n") : "no console/network errors, no overflow");
