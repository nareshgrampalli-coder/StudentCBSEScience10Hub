# Project Review and Improvement Backlog

**Review date:** 8 November 2026  
**Scope:** Science handbook content, navigation, Jekyll build, GitHub Pages workflow, repository documentation, and validation scripts.  
**Review mode:** Findings and recommendations only; no implementation changes are included in this report.

## Summary

The project has a working local Jekyll build and a 21-page navigation structure. The content should not yet be treated as publication-ready: several chapter pages contain the body of a different chapter, and alignment with the official 2026–27 CBSE Science syllabus has not been verified. GitHub Pages deployment is also blocked until Pages is enabled for the repository.

## Prioritized improvements

### P0 — Correct chapter bodies before publication

**Finding:** Eight chapter pages have learning goals and keyed questions for their named chapter, but their explanatory body was copied from the first chapter in the same unit:

- Chapters 2–4 repeat chemical-reaction material. For example, [Chapter 2](handbook/chapters/02-acids-bases-and-salts.md:14) defines reactants and explains balancing equations instead of acids, bases, and salts.
- Chapters 6–8 repeat Life Processes material. [Chapter 6](handbook/chapters/06-control-and-coordination.md:18) starts with nutrition and respiration, not control and coordination.
- [Chapter 10](handbook/chapters/10-human-eye-and-colourful-world.md:18) repeats reflection content rather than explaining the eye and dispersion.
- [Chapter 12](handbook/chapters/12-magnetic-effects-of-electric-current.md:18) repeats basic electricity content rather than magnetic effects.

As a result, students can be directed to learn the wrong material for the chapter title. The current checker does not catch this: [check-site.mjs](scripts/check-site.mjs:30) checks that question IDs have matching answer IDs, but not that the explanation or answer belongs to the chapter topic.

**Recommended improvement:** Restore or rewrite each affected chapter from its matching original unit section. Then add content-review checks or a human-reviewed chapter-to-topic checklist that detects accidental cross-chapter duplication. Have a Science educator verify the repaired material before treating it as complete.

### P1 — Verify scope and claims against the official CBSE syllabus

**Finding:** The handbook says the official PDF could not be reliably text-extracted and consequently does not verify topic inclusion, unit marks, practicals, or assessment details ([handbook/README.md](handbook/README.md:33); [examination overview](handbook/sections/examination-blueprint.md:14)). Nevertheless, the navigation presents a fixed 13-chapter sequence.

**Recommended improvement:** Extract or otherwise inspect the official 2026–27 subject syllabus using a reliable method, record its title, issuer, publication/session, URL, and review date, then map each listed topic to chapter coverage. Mark additions, omissions, or changed scope explicitly; avoid implying that a chapter list is syllabus-verified until that mapping is complete.

### P1 — Enable and verify GitHub Pages deployment

**Finding:** The site is configured to deploy through GitHub Actions, but the latest known workflow failed at “Configure GitHub Pages” because the repository had no Pages site enabled. The failure and reason are documented in the [workflow run](https://github.com/nareshgrampalli-coder/StudentCBSEScience10Hub/actions/runs/42457849817) and [README](README.md:42). The published URL returned 404 when checked.

**Recommended improvement:** Enable Pages in repository settings with **GitHub Actions** as the source, then verify a successful build/deploy run and check the home page and representative chapter URLs. Keep the README’s live-site wording conditional until that succeeds.

### P2 — Strengthen learning coverage and answer quality

**Finding:** Most chapter practice sets are small, and a passing ID match proves only that an answer with the same identifier exists. It does not check whether the question tests the stated objective, whether the worked reasoning is complete, or whether the answer is scientifically correct.

**Recommended improvement:** For each syllabus-verified learning objective, include at least one suitable retrieval or application task, with worked reasoning and appropriate units, diagrams, assumptions, and limitations. Independently solve calculation questions and review scientific explanations before publication. Clearly label original practice rather than suggesting past-paper provenance.

### P2 — Add rendered-site accessibility and interaction checks

**Finding:** Existing validation verifies rendered navigation markup and expected page counts ([check-rendered-site.mjs](scripts/check-rendered-site.mjs:16)), but it does not exercise browser navigation, mobile disclosure behaviour, keyboard interaction, focus visibility, or automated accessibility rules.

**Recommended improvement:** Add browser checks for the home-to-chapter path, Previous/Next links, current-page state, mobile contents disclosure, and keyboard-only operation. Run an accessibility scan on the home page and representative content pages, and include the results in CI.

### P3 — Reduce validation coupling to a fixed page count

**Finding:** The source and rendered checks hard-code 21 total pages and 13 chapters ([check-site.mjs](scripts/check-site.mjs:15); [check-rendered-site.mjs](scripts/check-rendered-site.mjs:16)). This catches accidental omissions today, but every intentional syllabus or navigation change requires synchronized test edits.

**Recommended improvement:** Keep explicit expected counts only if they are a deliberate syllabus assertion; otherwise derive structural validation from navigation data and validate chapter numbering, unique URLs, source-file existence, and adjacent navigation links. If a fixed count is retained, document the syllabus basis beside it.

## Validation performed

- `node --check scripts/check-site.mjs`
- `node --check scripts/check-rendered-site.mjs`
- `node scripts/check-site.mjs` — passed for 21 navigation entries and question/answer identifier matching.
- `jekyll build --destination <temporary directory>` — passed.
- `node scripts/check-rendered-site.mjs <temporary directory>` — passed for all 21 rendered pages.

These checks establish build and structural integrity, not scientific accuracy or syllabus completeness. The duplicated chapter bodies described above demonstrate that limitation.
