import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destination = path.resolve(process.argv[2] ?? path.join(root, "_site"));
const baseurl = "/StudentCBSEScience10Hub";
const yaml = await readFile(path.join(root, "_data", "book.yml"), "utf8");
const entries = [...yaml.matchAll(
  /^- title: "([^"]+)"\r?\n  url: (\/[^ \r\n]+)\r?\n  source: ([^ \r\n]+)\r?\n  group: ([^\r\n]+)$/gm
)].map((match) => ({ title: match[1], url: match[2] }));

const home = await readFile(path.join(destination, "index.html"), "utf8");
assert.ok(home.includes(`href="${baseurl}/assets/css/site.css"`), "Home page must use the GitHub Pages base URL for CSS");
assert.equal(entries.length, 21, "Expected overview, five units, 13 chapters, and two revision pages");

for (const entry of entries) {
  const pagePath = path.join(destination, entry.url.slice(1), "index.html");
  const html = await readFile(pagePath, "utf8");
  assert.ok(html.includes(`href="${baseurl}${entry.url}"`), `Home/navigation should link to ${entry.title}`);
  assert.ok(html.includes('aria-label="Book contents"'), `${entry.title} must render the contents navigation`);
  assert.ok(html.includes('aria-current="page"'), `${entry.title} must mark the current page`);
  assert.ok(html.includes('aria-label="Handbook navigation"'), `${entry.title} must render sequential navigation`);
}

for (const entry of entries) {
  assert.ok(home.includes(`href="${baseurl}${entry.url}"`), `Home page is missing ${entry.title}`);
}

console.log(`Validated rendered home page and ${entries.length} navigable pages.`);
