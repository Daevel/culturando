---
name: thesis-latex-maintainer
description: Academic synchronization layer between the evolving Culturando software repository and the LaTeX thesis.
---

# Thesis LaTeX Maintainer Skill — Culturando

## Purpose

This skill governs maintenance, validation and synchronization of the university thesis located in:

```text
thesis/thesis_latex/
```

The thesis is an academic Computer Science thesis derived from the real Culturando software project. It must remain technically accurate, academically conservative and structurally valid as the repository evolves.

This skill is not a license to write new thesis prose automatically. Its default role is to protect the LaTeX project, detect inconsistencies and decide whether repository changes have academic relevance.

## Mandatory Repository Role

Load and apply this skill at the beginning of every OpenCode session or task for this repository unless it has already been loaded in the current session.

Every repository task must end with a thesis-impact evaluation, even when the result is:

```text
Thesis impact: none
Reason: the change has no functional, architectural, persistence, privacy, geolocation, AI, testing, deployment or academic consequence.
```

## Scope

Read scope:

```text
the whole repository
```

Write scope while operating as this skill:

```text
thesis/thesis_latex/**
```

The skill may inspect application code, packages, configuration, README files, Git history and project skills to understand the real implementation. It must not modify unrelated application source files. If another knowledge source is stale, report that the appropriate project knowledge workflow must update it.

## Source-of-Truth Hierarchy

When sources conflict, use this order:

```text
1. Current source code
2. Current repository architecture and configuration
3. Current build/test/runtime behavior
4. .opencode/skills/project-context/SKILL.md
5. README.md and internal project documentation
6. Existing thesis text
```

`project-context` is important navigation material, but it is not absolute truth. Verify material claims against the repository before putting them in the thesis.

Never propagate stale project documentation into the thesis.

## Current Thesis Architecture

Preserve the existing modular LaTeX architecture:

```text
thesis/thesis_latex/main.tex
thesis/thesis_latex/config/packages.tex
thesis/thesis_latex/config/metadata.tex
thesis/thesis_latex/config/commands.tex
thesis/thesis_latex/frontmatter/
thesis/thesis_latex/chapters/
thesis/thesis_latex/bibliography/
thesis/thesis_latex/appendices/
```

Do not introduce a new organization merely because another layout could work. Do not add a `sections/` directory unless the thesis genuinely outgrows chapter-level organization and the restructuring is clearly justified.

## Editorial Comments Are Specifications

Detailed comments in `.tex` files are editorial and architectural specifications. Treat them as the contract for unfinished sections.

Future writing must follow this conceptual flow:

```text
existing section specification
-> repository evidence
-> academic or bibliographic evidence when needed
-> academic prose
```

Do not delete planning comments simply because they are comments. Remove or simplify them only after the corresponding section has been properly implemented and the comments no longer add value.

## Responsibility 1: LaTeX Guardian

Validate and, when safe, correct:

- LaTeX syntax;
- malformed commands;
- missing or incorrect braces;
- invalid environments;
- incorrect `\input{}` paths;
- incorrect `\include{}` paths;
- missing files;
- incorrect figure paths;
- bibliography configuration;
- unresolved citations;
- unresolved references;
- duplicate labels;
- wrong references;
- package mistakes;
- duplicate or incompatible imports;
- obvious misspellings;
- inconsistent technical terminology;
- compilation errors;
- relevant LaTeX warnings.

Automatic correction is allowed for mechanical, unambiguous errors such as broken imports, syntax mistakes, duplicate labels with an obvious intended correction, missing braces, wrong file paths and obvious spelling errors.

For semantic problems, be conservative. If an entire chapter contains duplicated or incorrect content, do not invent a replacement chapter. Detect the issue, determine why it exists, report it and correct only when enough real project or thesis information exists.

## Responsibility 2: Academic Writer

When writing thesis prose, enforce:

- formal academic register;
- clear progression of reasoning;
- consistent terminology;
- correct distinction between theory, requirements, architecture, implementation, testing, results, limitations and conclusions;
- explanations based on engineering decisions rather than file descriptions;
- no README-style prose;
- no marketing language;
- no filler written only to increase page count;
- no unsupported claims;
- no invented measurements;
- no invented statistics;
- no invented research results;
- no invented bibliography;
- no invented project functionality.

The thesis is an academic Computer Science thesis, not technical documentation and not a development changelog.

## Responsibility 3: Repository-To-Thesis Synchronization

Do not apply a mechanical rule of `code changed -> thesis changed`.

Use this flow:

```text
repository changed
-> analyze the real change
-> decide whether it has academic relevance
-> if relevant, determine affected thesis concepts
-> inspect existing thesis coverage
-> update the appropriate existing location
-> check whether older statements became obsolete
```

Commit messages may help navigation, but they must never determine thesis relevance alone. Inspect the diff, affected files, actual implementation, architectural consequences and functional consequences.

## Academic Relevance Matrix

Use this matrix as guidance, not as a rigid algorithm:

```text
Cosmetic UI change                  -> usually none
Formatting                          -> none
Internal rename                     -> usually none
Minor refactor                      -> usually none
Bug fix                             -> case-by-case
Reusable UI primitive               -> low
New domain feature                  -> high
New architectural package           -> high
New database entity/relation        -> high
Authentication architecture change  -> high
Geolocation strategy                -> very high
PostGIS/spatial query strategy      -> very high
Location privacy strategy           -> very high
OCR / AI cataloging pipeline        -> very high
New important external provider     -> medium/high
Testing strategy change             -> high
Meaningful deployment architecture  -> medium/high
Dependency update                   -> usually none
New core technology                 -> medium/high
```

Always consider the actual academic impact.

## Thesis-Impact Evaluation Template

Before completing any repository task, answer conceptually:

```text
What changed?

Does this change:
- functionality?
- requirements?
- architecture?
- persistence/data model?
- authentication?
- geolocation?
- privacy?
- AI/cataloging?
- user workflow?
- testing/validation?
- deployment?
- relevant limitations?

Is the change academically significant?
Does the thesis already represent the new state?
Did any existing thesis statement become obsolete?
Does the thesis need modification?
```

Valid outcomes include:

```text
Thesis impact: required
Reason: ...
Action: updated ... and validated LaTeX.
```

```text
Thesis impact: none
Reason: ...
Action: no thesis edit.
```

## Detect Obsolete Thesis Information

Synchronization is also consistency checking. Ask not only what must be added, but also what has become false or obsolete.

Example:

```text
Thesis says AI-assisted cataloging is future work.
Repository implements OCR/ISBN/Open Library cataloging.
```

Then revise or remove the obsolete future-work statement, document the current implementation in the appropriate chapter and check requirements, architecture, implementation, testing, results and conclusions for consistency.

The thesis must represent one coherent state of the project.

## Semantic Macros

Before hardcoding recurring project terms, inspect:

```text
thesis/thesis_latex/config/commands.tex
```

Reuse existing semantic macros when appropriate, especially for recurring project technologies and terms such as Culturando, Next.js, React, TypeScript, Nx, PostgreSQL, PostGIS, Prisma, Auth.js, MapLibre GL JS, LBS and GDPR.

If a new technology becomes frequently referenced, evaluate whether a new semantic macro belongs in `commands.tex`. Do not create macros for terms used only once.

## Bibliography Policy

The repository proves how Culturando works. It does not automatically prove general theoretical claims.

Never fabricate papers, books, authors, publication years, DOI values, statistics, research findings or institutional references.

Treat existing `references.bib` entries critically. Do not assume a bibliography entry is valid only because it exists. Use real and verifiable sources when academic evidence is required.

Do not perform unrelated bibliography research during infrastructure tasks unless needed to correct a confirmed issue.

## LaTeX Validation Workflow

Use the repository's existing toolchain. The current thesis is modular LaTeX with `biblatex` and Biber, and the repository shows `latexmk` usage.

Preferred validation when available:

```bash
cd thesis/thesis_latex
latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex
```

Do not introduce a new compiler or build system blindly. If the repository later explicitly switches to XeLaTeX, LuaLaTeX or another toolchain, adapt accordingly.

Compilation success is the primary technical validation. Optional tools such as `chktex`, `lacheck`, `aspell` or `hunspell` may be used only if already available and useful. Do not install new dependencies automatically.

## Validation Before Commit Or Push

When thesis files are modified, perform an appropriate sequence:

```text
1. inspect changed thesis files;
2. verify structure;
3. verify imports/includes;
4. inspect labels/references;
5. inspect bibliography changes;
6. check for duplicated content or accidental copies;
7. compile with the configured LaTeX toolchain;
8. inspect compilation errors and relevant warnings;
9. correct confirmed problems;
10. compile again;
11. inspect git diff;
12. ensure generated files are not accidentally staged.
```

Do not claim successful validation if the local environment cannot run the compiler. Report the limitation.

## Repository Hygiene

Generated LaTeX files are not authoritative thesis sources and should normally not be version-controlled. Keep ignore rules centralized in the root `.gitignore` unless there is a concrete reason not to.

Generated artifacts include:

```text
*.aux
*.bbl
*.bcf
*.blg
*.fdb_latexmk
*.fls
*.lof
*.lot
*.log
*.out
*.run.xml
*.synctex.gz
*.toc
```

Remove confirmed generated files from Git tracking without deleting source files. `main.pdf` is a special case and may remain versioned if keeping the latest compiled thesis accessible from GitHub is intentional.

## Structural Audit Rules

During thesis maintenance, detect:

- identical chapter files;
- incorrect chapter titles;
- chapter-number inconsistencies;
- duplicated sections;
- duplicated labels;
- orphaned chapter files;
- files included under the wrong name;
- stale `.aux` files suggesting previous chapter names;
- intentionally empty chapters waiting for content;
- accidental copies created during scaffolding.

Correct structural mistakes only when the intended structure is clear from the scaffold. Report semantic chapter-content problems instead of inventing content.

## Non-Goals

Do not:

- write full thesis chapters unless explicitly asked;
- replace unfinished chapters with invented prose;
- generate fake results;
- invent test outcomes;
- invent bibliographic references;
- restructure the entire thesis unnecessarily;
- modify application behavior;
- introduce unrelated dependencies;
- rewrite project architecture;
- perform a push automatically;
- rewrite Git history.

## Relationship With Other Skills

Keep responsibilities separate:

```text
project-context
-> technical and functional repository knowledge

thesis-latex-maintainer
-> academic interpretation, LaTeX validation and thesis synchronization

pre-push-sync-knowledge
-> synchronization orchestration before push

git-commits
-> Git commit conventions

AGENTS.md
-> persistent orchestration rules
```

Do not duplicate the whole Culturando architecture here. Use `project-context` for navigation, then verify claims against the repository.
