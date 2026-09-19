import { chromium } from "playwright";

const base = "http://localhost:4173";
const browser = await chromium.launch(
  // honour PW_CHROMIUM if set, otherwise use Playwright's bundled browser
  process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}
);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const fails = [];
const ok = [];
const check = (name, cond, extra = "") =>
  cond ? ok.push(name) : fails.push(`${name} ${extra}`);

page.on("pageerror", (e) => fails.push(`pageerror: ${e.message}`));

/* ------------------------------------------------ navigation: every link */
await page.goto(base + "/", { waitUntil: "networkidle" });

for (const [label, expect] of [
  ["About", "/about"],
  ["Academics", "/academics"],
  ["Life at ICS", "/life-at-ics"],
  ["Gallery", "/gallery"],
  ["Admissions", "/admissions"],
  ["Contact Us", "/contact"],
  ["Home", "/"],
]) {
  await page.getByRole("navigation").getByRole("link", { name: label, exact: true }).first().click();
  await page.waitForTimeout(250);
  check(`nav → ${label}`, new URL(page.url()).pathname === expect, `got ${page.url()}`);
}

/* --------------------------------------------------------- hero buttons */
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.getByRole("link", { name: /Enquire Now/ }).first().click();
await page.waitForTimeout(400);
check("hero Enquire Now → /admissions#registration", page.url().includes("/admissions"));
check("anchor scrolled to form", (await page.evaluate(() => window.scrollY)) > 300);

await page.goto(base + "/", { waitUntil: "networkidle" });
const brochure = await page
  .getByRole("link", { name: /Download Brochure/ })
  .first()
  .getAttribute("href");
const res = await page.request.get(base + brochure);
check("brochure download serves a PDF", res.ok() && res.headers()["content-type"].includes("pdf"));

await page.getByRole("link", { name: "View Curriculum" }).click();
await page.waitForTimeout(250);
check("View Curriculum → /academics", page.url().endsWith("/academics"));

await page.goto(base + "/", { waitUntil: "networkidle" });
await page.getByRole("link", { name: /Learn more/ }).first().click();
await page.waitForTimeout(250);
check("program Learn more → /academics", page.url().endsWith("/academics"));

/* -------------------------------------------------------- about sliders */
await page.goto(base + "/about", { waitUntil: "networkidle" });
await page.getByRole("link", { name: "Read Our History" }).click();
await page.waitForTimeout(250);
check("Read Our History → /founder-story", page.url().endsWith("/founder-story"));

await page.goto(base + "/about", { waitUntil: "networkidle" });
const featuredBefore = await page.locator("text=Featured").locator("..").innerText();
await page.getByRole("button", { name: "Next faculty member" }).click();
await page.waitForTimeout(500);
const featuredAfter = await page.locator("text=Featured").locator("..").innerText();
check("faculty carousel advances", featuredBefore !== featuredAfter);

await page.getByRole("button", { name: "Previous faculty member" }).click();
await page.waitForTimeout(500);
check(
  "faculty carousel goes back",
  (await page.locator("text=Featured").locator("..").innerText()) === featuredBefore
);

const award1 = await page.locator("article").first().innerText();
await page.getByRole("button", { name: "Next awards" }).click();
await page.waitForTimeout(400);
check("awards carousel pages", (await page.locator("article").first().innerText()) !== award1);

/* ------------------------------------------------- gallery filter + lightbox */
await page.goto(base + "/gallery", { waitUntil: "networkidle" });
const allCount = await page.locator("main button[aria-label^='Open ']").count();
await page.getByRole("button", { name: "Sports", exact: true }).click();
await page.waitForTimeout(300);
const sportsCount = await page.locator("main button[aria-label^='Open ']").count();
check("gallery filter narrows results", sportsCount > 0 && sportsCount < allCount, `${sportsCount}/${allCount}`);

await page.getByRole("button", { name: "All", exact: true }).click();
await page.waitForTimeout(250);
check("gallery filter restores", (await page.locator("main button[aria-label^='Open ']").count()) === allCount);

await page.locator("main button[aria-label^='Open ']").first().click();
await page.waitForTimeout(300);
check("lightbox opens", await page.getByRole("dialog").isVisible());
const title1 = await page.getByRole("dialog").locator("h2").innerText();
await page.getByRole("button", { name: "Next photo" }).click();
await page.waitForTimeout(300);
check(
  "lightbox next",
  (await page.getByRole("dialog").locator("h2").innerText()) !== title1
);
check(
  "lightbox dims and blurs the page behind it",
  await page
    .getByRole("dialog")
    .evaluate((e) => getComputedStyle(e).backdropFilter.includes("blur"))
);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
check("lightbox closes on Escape", (await page.getByRole("dialog").count()) === 0);

/* ----------------------------------------------------- admissions form */
await page.goto(base + "/admissions", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Submit Registration Portfolio" }).click();
await page.waitForTimeout(400);
check(
  "empty submit blocked with errors",
  (await page.locator("text=This field is required").count()) > 0 &&
    (await page.locator("text=Registration Pre-Approved").count()) === 0
);

const fill = {
  firstName: "Rahul",
  lastName: "Sharma",
  dob: "2015-04-12",
  residentialAddress: "12 8th Main, HAL 3rd Stage",
  phone: "9845012345",
  email: "parent@email.com",
  guardianName: "Anita Sharma",
};
for (const [k, v] of Object.entries(fill)) await page.locator(`[name="${k}"]`).fill(v);
await page.selectOption('[name="gender"]', "Male");

await page.locator('input[type="file"]').first().setInputFiles({
  name: "tc.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4 test"),
});
await page.locator('input[type="file"]').nth(1).setInputFiles({
  name: "marks.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4 test"),
});
await page.waitForTimeout(200);
check("upload shows the chosen file name", await page.locator("text=tc.pdf").isVisible());

await page.getByRole("button", { name: "Submit Registration Portfolio" }).click();
await page.waitForTimeout(600);
check("valid submit shows pre-approval", await page.locator("text=Registration Pre-Approved").isVisible());

await page.getByRole("button", { name: "Clear form" }).click();
await page.waitForTimeout(300);
check("clear form empties fields", (await page.locator('[name="firstName"]').inputValue()) === "");

/* -------------------------------------------------------- contact form */
await page.goto(base + "/contact", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Submit Message" }).click();
await page.waitForTimeout(300);
check(
  "contact validation fires",
  (await page.locator("p.text-red-600").count()) >= 3 &&
    (await page.locator("text=your message has reached").count()) === 0
);

await page.locator('[name="name"]').fill("Amit Kumar");
await page.locator('[name="email"]').fill("amit@email.com");
await page.locator('[name="phone"]').fill("9900012345");
await page.selectOption('[name="subject"]', "Campus Visit / Tour");
await page.locator('[name="message"]').fill("I would like to book a campus tour next week.");
await page.getByRole("button", { name: "Submit Message" }).click();
await page.waitForTimeout(400);
check("contact success message", await page.locator("text=your message has reached").isVisible());
check("contact form resets", (await page.locator('[name="name"]').inputValue()) === "");

const tel = await page.getByRole("link", { name: "080-25215207" }).first().getAttribute("href");
check("phone link is tel:", tel?.startsWith("tel:"), tel);
const mail = await page.getByRole("link", { name: /@gmail.com/ }).first().getAttribute("href");
check("email link is mailto:", mail?.startsWith("mailto:"), mail);

/* ------------------------------------------------------- founder story */
await page.goto(base + "/founder-story", { waitUntil: "networkidle" });
await page.getByRole("link", { name: "Explore the campus" }).click();
await page.waitForTimeout(300);
check("Explore the campus → /life-at-ics", page.url().endsWith("/life-at-ics"));

/* ------------------------------------------------------- footer + 404 */
await page.goto(base + "/life-at-ics", { waitUntil: "networkidle" });
await page.getByRole("contentinfo").getByRole("link", { name: "Affiliation" }).click();
await page.waitForTimeout(250);
check("footer link routes", page.url().endsWith("/academics"));

await page.goto(base + "/definitely-not-a-page", { waitUntil: "networkidle" });
check("unknown route shows 404 page", await page.locator("text=couldn't find that page").isVisible());

/* --------------------------------------------------------- mobile menu */
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Open menu" }).click();
await page.waitForTimeout(400);
check("mobile menu opens", await page.locator("#mobile-nav").getByRole("link", { name: "Gallery" }).isVisible());
await page.locator("#mobile-nav").getByRole("link", { name: "Gallery" }).click();
await page.waitForTimeout(400);
check("mobile menu navigates", page.url().endsWith("/gallery"));

await browser.close();
console.log(`PASS ${ok.length}`);
if (fails.length) {
  console.log("FAIL:\n" + fails.map((f) => " - " + f).join("\n"));
  process.exitCode = 1;
}
