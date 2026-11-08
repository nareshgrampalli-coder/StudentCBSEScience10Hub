import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const yaml = await readFile(new URL("_data/book.yml", root), "utf8");
const entries = [...yaml.matchAll(
  /^- title: "([^"]+)"\r?\n  url: (\/[^ \r\n]+)\r?\n  source: ([^ \r\n]+)\r?\n  group: ([^\r\n]+)$/gm
)].map((match) => ({
  title: match[1],
  url: match[2],
  source: match[3],
  group: match[4],
}));

assert.equal(entries.length, 21, "Expected overview, five units, 13 chapters, and two revision pages");
assert.equal(entries.filter((entry) => entry.group === "Units").length, 5);
assert.equal(entries.filter((entry) => entry.group === "Chapters").length, 13);
assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length, "Page URLs must be unique");

for (const [index, entry] of entries.entries()) {
  const markdown = await readFile(new URL(entry.source, root), "utf8");
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontMatter, `${entry.source} must have Jekyll front matter`);
  assert.match(frontMatter[1], /^layout: book$/m, `${entry.source} must use the book layout`);
  assert.match(frontMatter[1], new RegExp(`^permalink: ${entry.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  assert.match(frontMatter[1], new RegExp(`^title: "${entry.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"$`, "m"));
  assert.match(markdown, /^## /m, `${entry.source} must contain a second-level content heading`);

  if (entry.group === "Chapters") {
    const questions = [...markdown.matchAll(/^\*\*([A-Z]\d+)\.\*\*/gm)].map((match) => match[1]).sort();
    const answers = [...markdown.matchAll(/^- \*\*([A-Z]\d+):\*\*/gm)].map((match) => match[1]).sort();
    assert.ok(questions.length > 0, `${entry.source} must include practice questions`);
    assert.deepEqual(answers, questions, `${entry.source} must have one matching answer for every question`);
  }

  if (index > 0) {
    assert.match(frontMatter[1], new RegExp(`^previous_url: ${entries[index - 1].url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  } else {
    assert.doesNotMatch(frontMatter[1], /^previous_url:/m);
  }

  if (index < entries.length - 1) {
    assert.match(frontMatter[1], new RegExp(`^next_url: ${entries[index + 1].url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  } else {
    assert.doesNotMatch(frontMatter[1], /^next_url:/m);
    assert.match(frontMatter[1], new RegExp(`^previous_url: ${entries[index - 1].url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  }
}

const layout = await readFile(new URL("_layouts/book.html", root), "utf8");
assert.match(layout, /aria-label="Book contents"/);
assert.match(layout, /aria-current="page"/);
assert.match(layout, /Skip to content/);
assert.match(layout, /page\.previous_url/);
assert.match(layout, /page\.next_url/);

console.log(`Validated ${entries.length} Science pages, chapter coverage, page metadata, and navigation layout.`);
