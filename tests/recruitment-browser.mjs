// Local browser QA. All application POSTs are intercepted: no candidate writes.
// Run: node tests/recruitment-browser.mjs http://localhost:5055
// Requires an existing puppeteer-core installation and local Chrome.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { RECRUITMENT_CATEGORIES, MAX_RESUME_BYTES } from "../shared/recruitment.js";

const base = process.argv[2] || "http://localhost:5055";
const output = process.env.BROWSER_QA_OUTPUT || "/private/tmp/hospital-recruitment-qa";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const results = [];
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const cancelledMapNavigations = [];
const apiResponses = [];
let mode = "error";
let applicationPosts = 0;
let pendingRequest;
let browser;

function check(label, passed, detail) {
  results.push({ label, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }) });
}
const pause = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

await mkdir(output, { recursive: true });
const pdfPath = path.join(output, "synthetic-test-resume.pdf");
const invalidPath = path.join(output, "synthetic-test-resume.txt");
const largePath = path.join(output, "synthetic-oversize-resume.pdf");
await writeFile(pdfPath, "%PDF-1.4\n% Synthetic browser QA fixture; never sent to a server.\n%%EOF\n");
await writeFile(invalidPath, "Synthetic browser QA fixture; invalid resume format.");
await writeFile(largePath, Buffer.alloc(MAX_RESUME_BYTES + 1, 32));

try {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "POST") {
      if (url.pathname !== "/api/applications") {
        if (url.origin === new URL(base).origin) request.abort().catch(() => {});
        else request.continue().catch(() => {}); // Allow the embedded map to load normally.
        return;
      }
      applicationPosts += 1;
      if (mode === "pending") {
        pendingRequest = request;
        return;
      }
      request.respond({
        status: mode === "success" ? 201 : 503,
        contentType: "application/json",
        body: JSON.stringify(mode === "success" ? { success: true, applicationId: "synthetic-intercepted-only", createdAt: "2026-10-23T00:00:00Z" } : { message: "Simulated recoverable service error for browser QA." }),
      }).catch(() => {});
      return;
    }
    request.continue().catch(() => {});
  });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    const failure = { path: url.pathname, error: request.failure()?.errorText };
    // Leaving the page can cancel a lazy map document while it loads. Keep
    // these explicit in the report rather than treating them as broken assets.
    if (failure.error === "net::ERR_ABORTED" && request.resourceType() === "document" && /(^|\.)google\.com$/.test(url.hostname) && url.pathname.startsWith("/maps")) cancelledMapNavigations.push(failure);
    else failedRequests.push(failure);
  });
  page.on("response", (response) => {
    const pathname = new URL(response.url()).pathname;
    if (pathname.startsWith("/api/") && response.request().method() === "GET") apiResponses.push({ path: pathname, status: response.status() });
  });

  const initial = await page.goto(base, { waitUntil: "networkidle0" });
  check("Real page GET", initial.status() === 200, { status: initial.status() });
  const api = await page.evaluate(async () => {
    const response = await fetch("/api/jobs");
    const data = await response.json();
    const first = data.jobs?.[0];
    let detailStatus;
    if (first?.id) detailStatus = (await fetch(`/api/jobs/${encodeURIComponent(first.id)}`)).status;
    return { status: response.status, categoryCount: data.categories?.length, jobsCount: data.jobs?.length, detailStatus, firstCategory: first?.category_id };
  });
  check("Real jobs GET", api.status === 200, api);
  if (api.jobsCount) check("Real first job GET", api.detailStatus === 200 && RECRUITMENT_CATEGORIES.some((category) => category.id === api.firstCategory), { status: api.detailStatus, approvedCategory: RECRUITMENT_CATEGORIES.some((category) => category.id === api.firstCategory) });

  for (const width of [320, 375, 430, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 900 });
    await page.goto(base, { waitUntil: "networkidle0" });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const geometry = await page.evaluate(() => {
      const rect = (selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      };
      const elements = [...document.querySelectorAll("body *")].filter((element) => {
        const style = getComputedStyle(element);
        return element.getClientRects().length && style.visibility !== "hidden" && style.position !== "absolute" && !element.closest("svg, option");
      });
      const overflow = elements.filter((element) => {
        const r = element.getBoundingClientRect();
        return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
      }).map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`).slice(0, 12);
      const clippedControls = [...document.querySelectorAll("input:not([type=file]):not([type=checkbox]), textarea")].filter((element) => element.scrollWidth > element.clientWidth + 2).map((element) => element.name);
      return { header: rect("header"), apply: rect("#apply"), hero: rect("#hero"), opportunities: rect("#opportunities"), eligibility: rect("#eligibility"), forms: document.querySelectorAll("#apply form").length, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, overflow, clippedControls, brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).map((image) => image.getAttribute("src")) };
    });
    check(`${width}px single application form`, geometry.forms === 1);
    check(`${width}px responsive section order`, width < 1024 ? geometry.apply.top >= geometry.header.bottom - 1 && geometry.apply.top <= geometry.header.bottom + 2 && geometry.apply.top < geometry.hero.top : geometry.hero.top < geometry.opportunities.top && geometry.opportunities.top < geometry.eligibility.top && geometry.eligibility.top < geometry.apply.top, geometry);
    check(`${width}px no horizontal overflow`, geometry.documentWidth <= width + 1 && !geometry.overflow.length && !geometry.clippedControls.length, { documentWidth: geometry.documentWidth, overflowingElements: geometry.overflow, clippedControls: geometry.clippedControls });
    check(`${width}px no broken images`, !geometry.brokenImages.length, geometry.brokenImages);
    if ([375, 1440].includes(width)) {
      await page.screenshot({ path: path.join(output, `recruitment-${width}.png`), fullPage: true });
      await page.screenshot({ path: path.join(output, `recruitment-${width}-top.png`) });
    }
    check(`${width}px exactly four category options`, await page.$$eval('[name="hiringCategory"] option', (options) => options.filter((option) => option.value).length) === 4);
    check(`${width}px essential form fields only`, await page.$$eval('#apply input, #apply select', (controls) => {
      const names = controls.map((control) => control.name).sort();
      return JSON.stringify(names) === JSON.stringify(["fullName", "email", "mobile", "hiringCategory", "applyingFor", "qualification", "totalExperience", "resume", "confirmed"].sort());
    }));
    const compact = await page.evaluate(() => ({ formHeight: document.getElementById("apply").getBoundingClientRect().height, cards: [...document.querySelectorAll("#opportunities article")].map((card) => card.getBoundingClientRect().height), introductionCentered: getComputedStyle(document.getElementById("opportunities-heading").parentElement).textAlign === "center", allDesignations: document.querySelectorAll("#opportunities article li").length, map: Boolean(document.querySelector('#contact iframe[title][loading="lazy"]')) }));
    check(`${width}px centered founding team introduction`, compact.introductionCentered && await page.$eval('#opportunities-heading', (heading) => heading.textContent === "Join our Founding Team"));
    check(`${width}px all designation information retained`, compact.allDesignations === RECRUITMENT_CATEGORIES.reduce((sum, category) => sum + category.designations.length, 0));
    check(`${width}px location map present`, compact.map);
    if (width >= 1024) check(`${width}px compact form fits desktop frame`, compact.formHeight <= 750, compact);
    if (width >= 1280) check(`${width}px compact collapsed cards`, compact.cards.every((height) => height <= 460), compact.cards);

    for (const category of RECRUITMENT_CATEGORIES) {
      const selector = `#opportunities button[aria-label=${JSON.stringify(`Apply Now — ${category.title}`)}]`;
      await page.click(selector);
      await page.waitForFunction((id) => document.querySelector('[name="hiringCategory"]').value === id, {}, category.id);
      const state = await page.evaluate(() => ({ category: document.querySelector('[name="hiringCategory"]').value, designation: document.querySelector('[name="applyingFor"]').value, options: [...document.querySelectorAll('[name="applyingFor"] option')].filter((option) => option.value).map((option) => option.value), applyTop: document.querySelector("#apply").getBoundingClientRect().top, headerBottom: document.querySelector("header").getBoundingClientRect().bottom }));
      check(`${width}px ${category.id} preselection/designations`, state.category === category.id && JSON.stringify(state.options) === JSON.stringify(category.designations) && state.designation === "");
      check(`${width}px ${category.id} form anchor clears header`, state.applyTop >= state.headerBottom - 1 && state.applyTop <= state.headerBottom + 40, { applyTop: state.applyTop, headerBottom: state.headerBottom });
      await page.select('[name="applyingFor"]', category.designations[0]);
      await page.click(selector);
      await pause();
      check(`${width}px ${category.id} repeated Apply preserves matching designation`, await page.$eval('[name="applyingFor"]', (element) => element.value) === category.designations[0]);
    }
    await page.select('[name="hiringCategory"]', "medical");
    await page.select('[name="applyingFor"]', "Professor");
    await page.select('[name="hiringCategory"]', "nursing");
    check(`${width}px category change resets designation`, await page.$eval('[name="applyingFor"]', (element) => element.value) === "");
  }

  for (const category of RECRUITMENT_CATEGORIES) {
    const selector = `#opportunities article[aria-labelledby="category-${category.id}"] details`;
    await page.$eval(`${selector} summary`, (summary) => summary.click());
    check(`${category.id} full designation disclosure opens`, await page.$eval(selector, (details) => details.open));
    await page.$eval(`${selector} summary`, (summary) => summary.click());
  }

  for (const pathname of ["/services", "/doctors", "/facilities"]) {
    await page.goto(new URL(pathname, base).href, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => location.pathname === "/");
    await page.reload({ waitUntil: "networkidle0" });
    check(`${pathname} redirects and reloads single page`, new URL(page.url()).pathname === "/" && await page.$("#apply") !== null);
  }

  await page.setViewport({ width: 375, height: 900 });
  await page.goto(base, { waitUntil: "networkidle0" });
  for (const id of ["hero", "opportunities", "eligibility", "apply", "contact"]) {
    await page.evaluate((sectionId) => document.getElementById(sectionId).scrollIntoView({ behavior: "instant", block: "start" }), id);
    const anchor = await page.evaluate((sectionId) => ({ top: document.getElementById(sectionId).getBoundingClientRect().top, header: document.querySelector("header").getBoundingClientRect().bottom }), id);
    check(`${id} heading anchor unobscured`, anchor.top >= anchor.header - 1, anchor);
  }

  await page.goto(base, { waitUntil: "networkidle0" });
  check("No console errors before simulated submission failures", consoleErrors.length === 0, [...consoleErrors]);
  check("No failed real page resource requests", failedRequests.length === 0, [...failedRequests]);
  const beforeValidation = applicationPosts;
  await page.click('#apply button[type="submit"]');
  check("Empty form validation prevents POST", applicationPosts === beforeValidation && await page.$$eval('#apply [role="alert"]', (elements) => elements.length) > 0);
  const fixture = { fullName: "Synthetic Browser QA", email: "browser-qa@example.invalid", mobile: "9876543210", qualification: "Synthetic QA qualification", totalExperience: "0" };
  for (const [name, value] of Object.entries(fixture)) await page.type(`[name="${name}"]`, value);
  await page.select('[name="hiringCategory"]', "medical");
  await page.select('[name="applyingFor"]', "Professor");
  await page.click('[name="confirmed"]');
  const fileInput = await page.$('[name="resume"]');
  await fileInput.uploadFile(invalidPath);
  await page.click('#apply button[type="submit"]');
  check("Invalid resume format prevents POST", applicationPosts === beforeValidation && await page.$eval('[name="resume"]', (element) => element.getAttribute("aria-invalid")) === "true");
  await fileInput.uploadFile(largePath);
  await page.click('#apply button[type="submit"]');
  check("Oversize resume prevents POST", applicationPosts === beforeValidation && await page.$eval('[name="resume"]', (element) => element.getAttribute("aria-invalid")) === "true");
  await fileInput.uploadFile(pdfPath);
  const valuesBefore = await page.$$eval('#apply input, #apply select', (elements) => elements.map((element) => ({ name: element.name, value: element.type === "file" ? element.files[0]?.name : element.type === "checkbox" ? element.checked : element.value })));
  mode = "pending";
  await page.$eval('#apply form', (form) => { form.requestSubmit(); form.requestSubmit(); });
  await page.waitForFunction(() => document.querySelector('#apply form').getAttribute("aria-busy") === "true");
  await pause(150);
  check("Pending submission disables form and submit", await page.$eval('#apply button[type="submit"]', (element) => element.disabled) && await page.$eval('[name="fullName"]', (element) => element.matches(":disabled")));
  check("Duplicate pending submission prevented", applicationPosts === beforeValidation + 1, { simulatedPostCount: applicationPosts - beforeValidation });
  assert(pendingRequest, "Expected intercepted pending request");
  await pendingRequest.respond({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Simulated recoverable service error for browser QA." }) });
  pendingRequest = undefined;
  await page.waitForFunction(() => document.querySelector('#apply form')?.getAttribute("aria-busy") === "false");
  const valuesAfter = await page.$$eval('#apply input, #apply select', (elements) => elements.map((element) => ({ name: element.name, value: element.type === "file" ? element.files[0]?.name : element.type === "checkbox" ? element.checked : element.value })));
  check("Simulated 503 retains all values and selected file", JSON.stringify(valuesBefore) === JSON.stringify(valuesAfter));
  check("Simulated 503 shows recoverable error", await page.$eval("#apply", (element) => element.textContent.includes("Your application could not be submitted.") && element.textContent.includes("Your details and resume are still here.")));
  mode = "success";
  await page.click('#apply button[type="submit"]');
  await page.waitForFunction(() => document.querySelector("#apply").textContent.includes("Application submitted successfully"));
  check("Simulated 201 shows accessible success", await page.$$eval('#apply [role="status"]', (elements) => elements.some((element) => element.textContent.includes("Application submitted successfully"))));
  const successButton = await page.$("#apply button");
  await successButton.click();
  check("Simulated success clears form for another application", await page.$eval('[name="fullName"]', (element) => element.value === "") && await page.$eval('[name="resume"]', (element) => element.files.length === 0));
  check("No JavaScript runtime errors", pageErrors.length === 0, pageErrors);
  const summary = { base, cancelledMapNavigations, passed: results.filter((result) => result.passed).length, failed: results.filter((result) => !result.passed).length, results, apiResponses, consoleErrors, pageErrors, failedRequests, simulatedApplicationPosts: applicationPosts, simulationNotice: "Every application POST was intercepted locally. These UI simulations do not verify real database persistence or storage.", screenshots: [375, 1440].map((width) => path.join(output, `recruitment-${width}.png`)) };
  await writeFile(path.join(output, "results.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({
    base, passed: summary.passed, failed: summary.failed,
    failures: results.filter((result) => !result.passed),
    pageErrors, failedRequests, cancelledMapNavigations,
    simulatedApplicationPosts: applicationPosts,
    consoleErrorsAfterSimulation: consoleErrors,
    simulationNotice: summary.simulationNotice,
    reportPath: path.join(output, "results.json"), screenshots: summary.screenshots,
  }, null, 2));
  if (summary.failed) process.exitCode = 1;
} catch (error) {
  console.error(error.stack);
  process.exitCode = 1;
} finally {
  if (pendingRequest) await pendingRequest.abort().catch(() => {});
  await browser?.close();
}
