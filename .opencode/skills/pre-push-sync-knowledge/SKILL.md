---
name: pre-push-sync-knowledge
description: Git push, pre-push, project knowledge, internal documentation. Use before suggesting or running git push to keep Culturando agent knowledge synchronized.
---

# Pre-Push Knowledge Sync Skill — Culturando

## Purpose of the skill

This skill defines the behavior that every agent must follow **before launching a push** in the **Culturando** project.

The goal is not only to verify that the commit is correct, but also to keep the project skills and context documents up to date, so that every future agent is aware of the real state of the application, the installed libraries, the introduced features and the architectural decisions that were made.

This skill must be executed after:

- the agent has already read `git status`;
- the agent has already analyzed the modified files;
- the agent has already built one or more commits according to the `git-commits` skill;
- the agent is about to suggest or launch a `git push`.

Before the push, the agent must ask itself:

> Do the changes just committed change anything that future agents need to know?

If the answer is yes, it must update the relevant skill or context document before the push.

---

## Fundamental principle

The code and the project knowledge must remain synchronized.

Every time the project evolves, the internal documentation for the agents must evolve too.

Example:

```txt
If Auth.js is introduced in the code,
the project context skill must state that authentication is handled through Auth.js.

If packages/translation is created,
the context skill must explain that the project uses a shared package for texts and i18n dictionaries.

If new UI components are added,
the skill must update the list or the description of the components/ui area.

If an important new library is installed,
the skill must state its architectural role.
```

---

## When to run this skill

This skill must be executed:

- before every push;
- after creating one or more commits;
- after modifying important architecture, features, packages, dependencies, pages, components or configurations;
- before sending code that changes the technical context of the project.

It is not necessary to update the skills if the commit only concerns:

- minor typos;
- small non-structural visual fixes;
- temporary changes;
- automatic formatting;
- removal of irrelevant dead code;
- changes already fully described in the existing skills.

---

## Mandatory pre-push checklist

Before proposing or launching:

```bash
git push
```

the agent must verify:

```txt
1. Have I checked git status?
2. Have I understood which files were modified?
3. Have I created coherent commits separated by area?
4. Do the changes introduce new project knowledge?
5. Are the internal skills/documents still up to date?
6. If necessary, have I updated the relevant skill?
7. Have I also committed the skill/documentation update?
8. Have I run or suggested the appropriate technical checks?
```

---

## Commands to use before the push

The agent must always start from:

```bash
git status
```

Then, if needed, it must check the most recent commits:

```bash
git log --oneline -5
```

To see what is included in the most recent commit:

```bash
git show --stat HEAD
```

To check multiple commits before the push:

```bash
git log --oneline origin/main..HEAD
```

Or, if the remote branch is not `main`, adapt the reference:

```bash
git log --oneline origin/<branch>..HEAD
```

To check the files modified compared to the remote:

```bash
git diff --name-only origin/main..HEAD
```

---

## What the agent must look for

The agent must identify whether the commits introduce:

```txt
- new libraries;
- new features;
- new pages;
- new components;
- new packages;
- new configurations;
- new architectural rules;
- new structural folders;
- new development patterns;
- new technical choices;
- changes to the auth system;
- changes to the i18n system;
- changes to the database;
- changes to geolocation;
- changes to the UI foundation;
- changes to the roadmap;
- changes to the technical stack;
- changes to commit management;
- changes to the development workflows.
```

If one of these is present, the documentation/skill must be evaluated.

---

## Documents and skills to update

The project knowledge files may include, for example:

```txt
.opencode/skills/project-context/SKILL.md
.opencode/skills/git-commits/SKILL.md
.opencode/skills/pre-push-sync-knowledge/SKILL.md
other future project skills
README.md
docs/*
```

The main project context skill is:

```txt
.opencode/skills/project-context/SKILL.md
```

This must be updated when the following change:

- technical stack;
- architecture;
- main features;
- folder structure;
- shared packages;
- roadmap;
- project conventions;
- fundamental libraries;
- relevant technical choices.

The commits skill is:

```txt
.opencode/skills/git-commits/SKILL.md
```

This must be updated when the following change:

- commit conventions;
- allowed scopes;
- staging rules;
- naming rules;
- Git procedures;
- branch/push workflow.

This skill is:

```txt
.opencode/skills/pre-push-sync-knowledge/SKILL.md
```

This must be updated when the following change:

- pre-push rules;
- skill update criteria;
- mandatory checklists;
- criteria for deciding whether to update the knowledge base or not.

---

## "If necessary" rule

The agent must not update the skills mechanically for every commit.

It must do so **only if the change alters the useful knowledge of the project**.

### Examples where the skill must be updated

#### Auth.js

If Auth.js is installed and configured:

```txt
installed packages:
- next-auth or @auth/*
created files:
- apps/web/src/config/auth.ts
- apps/web/src/app/api/auth/[...nextauth]/route.ts
- middleware.ts
```

Then update `.opencode/skills/project-context/SKILL.md` in the sections:

```txt
- Technical stack
- Auth feature
- Roadmap
- Web application architecture
```

Add that:

```txt
Authentication is handled through Auth.js.
The auth feature uses the Credentials Provider or configured providers.
Protected routes will go through Auth.js middleware/session.
```

---

#### New package `packages/translation`

If the following is created:

```txt
packages/translation
```

Then update `.opencode/skills/project-context/SKILL.md` in the sections:

```txt
- Shared packages
- i18n / translation package
- Architectural conventions
```

Add that:

```txt
The project uses @culturando/translation to centralize dictionaries and textual keys.
The web app consumes the translations through useTranslation.
Hardcoded texts must be avoided where a translation key exists.
```

---

#### New UI components

If components such as the following are created:

```txt
Checkbox
Textarea
Dialog
Select
FormMessage
```

Then update the UI section of the context skill.

Example:

```txt
components/ui includes reusable base components such as Button, Input, Label, Card, Badge, Checkbox and FormMessage.
```

There is no need to update the skill for small CSS class adjustments.

---

#### New pages

If important routes are created:

```txt
/dashboard
/books
/books/[slug]
/dashboard/books/new
```

Then update:

```txt
- app router structure
- the affected feature
- the roadmap, if a part moves from future to current
```

Example:

```txt
The dashboard has been introduced as the user private area and represents the post-login destination.
```

---

#### New libraries

If an architecturally relevant library is installed:

```txt
zod
next-auth
prisma
@prisma/client
maplibre-gl
react-map-gl
lucide-react
```

Then update the technical stack and explain the role of the library.

Example:

```txt
Zod is used for the type-safe validation of forms and user inputs.
```

There is no need to update the skill for indirect dependencies or minor libraries not used directly in the project.

---

#### Database

If Prisma/PostgreSQL/PostGIS is introduced:

Update:

```txt
- Technical stack
- packages/db
- Database
- Books/Nearby features, if affected
```

Add:

```txt
The database is managed through Prisma.
PostgreSQL is the main relational database.
PostGIS is used for geospatial queries and proximity searches.
```

---

#### MapLibre

If MapLibre is introduced:

Update:

```txt
- Technical stack
- packages/geo
- Nearby / MapLibre
- Geolocation feature
```

Add:

```txt
MapLibre GL JS handles the rendering of the interactive maps.
Dynamic data is represented through GeoJSON layers.
```

---

#### AI cataloging

If code is introduced in `packages/ai` or in the cataloging feature:

Update:

```txt
- packages/ai
- AI cataloging
- roadmap
```

Add:

```txt
Assisted cataloging supports ISBN extraction, metadata normalization and suggestions for the book record.
```

---

## When not to update the skill

Do not update the skills if the commit only concerns:

```txt
- typo fixes in a component;
- marginal Tailwind class changes;
- local non-architectural renames;
- Biome formatting;
- internal refactors without new rules or patterns;
- small fixes that do not change the project knowledge;
- temporary or experimental changes not yet consolidated.
```

Example:

```txt
style(auth): adjust login form spacing
```

Does not require a skill update.

Example:

```txt
fix(auth): correct label htmlFor attribute
```

Does not require a skill update, unless the fix introduces a new pattern to follow.

---

## Rule on committing the updated skills

If the agent updates a skill or a context document, it must create a dedicated commit or include it in a coherent `docs(...)` commit.

Examples:

```bash
git add .opencode/skills/project-context/SKILL.md
git commit -m "docs(project): update architecture context for Auth.js"
```

```bash
git add .opencode/skills/git-commits/SKILL.md
git commit -m "docs(git): update commit grouping rules"
```

```bash
git add .opencode/skills/pre-push-sync-knowledge/SKILL.md
git commit -m "docs(workflow): add pre-push knowledge sync skill"
```

Do not mix context documentation updates with complex feature code, unless they are part of the same change and the team prefers a single commit.

Recommended preference:

```txt
1 commit for the code
1 commit for the skill/documentation update
```

---

## Complete operating order

When an agent is about to push, it must follow this order:

```txt
1. Read git status.
2. Check the local commits not yet pushed.
3. Analyze the files included in the commits.
4. Understand whether the commits change the stack, architecture, features or conventions.
5. If no skill update is needed, proceed to the pre-push checks.
6. If a skill update is needed, modify the relevant file.
7. Commit the skill change with a docs(...) commit.
8. Run or suggest the technical checks.
9. Re-check git status.
10. Proceed with git push.
```

---

## Pre-push analysis template

The agent must reason with this scheme:

```txt
Pre-push analysis

Commits ready to push:
- feat(auth): ...
- feat(packages): ...

Changed areas:
- auth
- packages/config
- packages/types

Knowledge impact:
- Does this change the project architecture? yes/no
- Does this introduce new libraries? yes/no
- Does this introduce new features? yes/no
- Does this change conventions? yes/no

Skill updates required:
- .opencode/skills/project-context/SKILL.md: yes/no
- .opencode/skills/git-commits/SKILL.md: yes/no
- .opencode/skills/pre-push-sync-knowledge/SKILL.md: yes/no

Action:
- update skill before push
- or proceed without skill update
```

---

## Complete example: introducing Auth.js

### Commit already created

```txt
feat(auth): setup Auth.js credentials authentication
```

### Modified files

```txt
apps/web/src/config/auth.ts
apps/web/src/app/api/auth/[...nextauth]/route.ts
apps/web/src/features/auth/actions/login.action.ts
apps/web/src/middleware.ts
package.json
pnpm-lock.yaml
```

### Analysis

```txt
The change introduces Auth.js as the authentication system.
It changes the technical stack.
It changes the behavior of the auth feature.
It introduces API routes and middleware.
```

### Skills to update

```txt
.opencode/skills/project-context/SKILL.md
```

### Documentation commit

```bash
git add .opencode/skills/project-context/SKILL.md
git commit -m "docs(project): update auth architecture context"
```

### Then push

```bash
git push
```

---

## Complete example: new translation package

### Commit already created

```txt
feat(translation): add shared translation package
```

### Modified files

```txt
packages/translation/package.json
packages/translation/src/dictionaries/it.ts
packages/translation/src/dictionaries/en.ts
packages/translation/src/get-translation.ts
packages/translation/src/index.ts
apps/web/src/hooks/useTranslation.ts
apps/web/src/features/auth/components/LoginForm.tsx
apps/web/src/features/auth/components/SignupForm.tsx
```

### Analysis

```txt
The change introduces a new shared package.
It removes or reduces hardcoded texts.
It adds a reusable translation pattern.
It changes the conventions for writing texts in components.
```

### Skills to update

```txt
.opencode/skills/project-context/SKILL.md
```

Possible update:

```txt
The project uses @culturando/translation to centralize dictionaries and textual keys.
The web app exposes useTranslation as a React-specific hook.
Components must use t("...") instead of hardcoded texts when a key exists.
```

### Documentation commit

```bash
git add .opencode/skills/project-context/SKILL.md
git commit -m "docs(project): update translation architecture context"
```

---

## Complete example: new UI components

### Commit already created

```txt
feat(ui): add checkbox and form message components
```

### Modified files

```txt
apps/web/src/components/ui/checkbox.tsx
apps/web/src/components/ui/form-message.tsx
apps/web/src/features/auth/components/LoginForm.tsx
```

### Analysis

```txt
The change adds generic UI components.
The knowledge of the components/ui area must be updated.
```

### Skills to update

```txt
.opencode/skills/project-context/SKILL.md
```

### Documentation commit

```bash
git add .opencode/skills/project-context/SKILL.md
git commit -m "docs(project): update shared UI components context"
```

---

## Rule on technical checks

Before the push, if parts of the code were modified, suggest or run:

```bash
pnpm biome:check
pnpm build
```

If the change only concerns Markdown documentation, the following may be enough:

```bash
git status
```

If the change concerns packages, config, Next.js or TypeScript, always prefer:

```bash
pnpm build
pnpm biome:check
```

---

## Final rule before the push

The push may only be suggested when:

```txt
- git status is clean or contains only intentional changes not included;
- the commits are separated correctly;
- the skills/documents are updated if necessary;
- any skill updates have been committed;
- the appropriate technical checks have been run or recommended.
```

---

## Standard operating phrase

When the agent concludes the pre-push analysis, it must respond with a phrase similar to:

```txt
The push is ready: the commits are coherent, no skill updates are needed and the status is clean.
```

Or:

```txt
Before the push it is necessary to update .opencode/skills/project-context/SKILL.md, because this change introduces a new architectural decision that future agents must know.
```

---

## Concluding principle

Every push must leave the project in a coherent state not only at the code level, but also at the knowledge level.

A future agent must be able to read the project skills and understand:

```txt
- what exists in the code;
- which libraries are used;
- which features have been introduced;
- which patterns are mandatory;
- which conventions must be respected;
- which areas are future and which are already implemented.
```

The code evolves. The knowledge of the agents must evolve together with the code.
