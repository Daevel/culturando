---
name: git-commits
description: Git commit, commit message, git status, git diff. Use when preparing, suggesting, reviewing, or creating commits for the Culturando project.
---

# Git Commits Skill — Culturando

## Purpose of the skill

This skill defines the rules that every agent must follow when preparing, suggesting or writing a commit for the **Culturando** project.

The goal is to maintain a clear, readable and professional Git history, using standard international conventions and correctly separating commits based on the project area that was modified.

Every commit must remain understandable even over time and must precisely explain what was done, where it was done and why it belongs to a given area.

---

## Mandatory initial rule

Before proposing or creating any commit, the agent must always check the state of the modified files using:

```bash
git status
```

If more detail is needed, it must also use:

```bash
git diff --stat
git diff --name-only
git diff
```

The agent must never write a generic commit without first verifying which files were modified, added or removed.

---

## Purpose of the `git status` check

The `git status` command is used to understand:

- which files were modified;
- which files were added;
- which files were deleted;
- which files are untracked;
- whether the changes belong to a single area or to multiple areas of the project;
- whether it is better to create a single commit or multiple separate commits.

---

## Grouping rule

The agent must separate commits based on the area the changes belong to.

In the Culturando project the main areas are:

```txt
web
packages
auth
ui
config
types
db
geo
ai
translation
docs
tooling
repo
```

If the changes involve different and independent areas, the agent must propose separate commits.

Example:

```txt
Changes to LoginForm.tsx and SignupForm.tsx
→ commit area auth or web/auth

Changes to packages/config and packages/types
→ commit area packages

Changes to README.md or documentation
→ commit area docs

Changes to biome.json, pnpm-workspace.yaml, root package.json
→ commit area tooling or repo
```

---

## Mandatory commit format

Commits must follow the **Conventional Commits** format:

```txt
type(scope): short description
```

Examples:

```txt
feat(auth): implement login form
feat(web): add auth routes
feat(packages): add shared config package
refactor(auth): move auth copy into feature constants
fix(ui): correct input checkbox usage
docs(project): add architecture context
chore(repo): update workspace configuration
```

---

## Allowed commit types

### `feat`

Use when a new feature is added.

Examples:

```txt
feat(auth): implement login form
feat(web): add signup page
feat(packages): add shared translation package
```

---

### `fix`

Use when a bug is corrected.

Examples:

```txt
fix(auth): correct password label target
fix(ui): prevent children on input component
fix(config): restore tailwind content paths
```

---

### `refactor`

Use when the code is restructured without changing functional behavior.

Examples:

```txt
refactor(auth): move login form into feature folder
refactor(web): derive metadata from shared app config
refactor(packages): reorganize shared domain types
```

---

### `docs`

Use for documentation, `.md` files, README, skills or architectural notes.

Examples:

```txt
docs(project): add architecture context skill
docs(git): add commit conventions skill
docs(readme): update setup instructions
```

---

### `chore`

Use for technical activities not directly related to a feature or bug fix.

Examples:

```txt
chore(repo): configure pnpm workspace
chore(tooling): add biome scripts
chore(deps): install zod
```

---

### `style`

Use only for stylistic changes that do not change logic.

Examples:

```txt
style(auth): improve login form spacing
style(ui): update card shadow classes
```

---

### `test`

Use for tests.

Examples:

```txt
test(auth): add login schema validation tests
test(geo): add distance calculation tests
```

---

### `build`

Use for changes to the build system.

Examples:

```txt
build(web): configure next transpile packages
build(repo): update nx build settings
```

---

### `ci`

Use for CI/CD pipelines.

Examples:

```txt
ci(github): add build workflow
ci(repo): run biome checks on pull requests
```

---

## Recommended scopes for Culturando

Scopes must be short, clear and consistent with the project area.

Main scopes:

```txt
auth
web
ui
packages
config
types
db
geo
ai
translation
project
repo
tooling
docs
deps
```

### When to use `auth`

Use for changes to:

```txt
apps/web/src/features/auth
apps/web/src/app/auth
```

Examples:

```txt
feat(auth): implement signup form
fix(auth): validate confirm password field
refactor(auth): move auth text into constants
```

---

### When to use `web`

Use for general changes to the web app:

```txt
apps/web/src/app
apps/web/next.config.js
apps/web/tailwind.config.js
apps/web/postcss.config.mjs
```

Examples:

```txt
feat(web): add dashboard placeholder
refactor(web): configure root layout metadata
fix(web): resolve Tailwind config loading issue
```

---

### When to use `ui`

Use for generic components:

```txt
apps/web/src/components/ui
```

Examples:

```txt
feat(ui): add checkbox component
fix(ui): correct input component props
style(ui): update button variants
```

---

### When to use `packages`

Use for changes that span the shared packages.

Examples:

```txt
feat(packages): add shared workspace packages
refactor(packages): expose shared config exports
```

If the package is specific, prefer the specific scope.

---

### When to use `config`

Use for:

```txt
packages/config
apps/web/src/config
```

Examples:

```txt
feat(config): add app metadata values
refactor(config): centralize auth constraints
```

---

### When to use `types`

Use for:

```txt
packages/types
```

Examples:

```txt
feat(types): add book and loan domain types
refactor(types): split auth and user types
```

---

### When to use `translation`

Use for the future i18n package:

```txt
packages/translation
apps/web/src/hooks/useTranslation.ts
```

Examples:

```txt
feat(translation): add shared dictionaries
refactor(translation): replace auth copy with translation keys
```

---

### When to use `docs`

Use for:

```txt
README.md
*.md
project skills
architecture notes
```

Examples:

```txt
docs(project): add Culturando architecture context
docs(git): add commit conventions skill
```

---

## Single or multiple commits

The agent must evaluate whether to create a single commit or multiple commits.

### Single commit

It is fine if the changes belong to the same activity.

Example:

```txt
feat(auth): implement login and signup forms
```

It may include:

```txt
- LoginForm.tsx
- SignupForm.tsx
- login.schema.ts
- signup.schema.ts
- auth-form.types.ts
```

---

### Multiple commits

They are preferred when the changes belong to different areas.

Example:

```txt
feat(auth): implement login and signup forms
```

```txt
feat(packages): add shared config and types packages
```

```txt
docs(project): add architecture context skill
```

Unrelated changes must not be mixed into a single commit, for example:

```txt
auth forms + package translation + README + Tailwind fix
```

In that case the agent must propose separate commits.

---

## Multiline commit format

When the commit includes several related activities, use a multiline message.

Format:

```bash
git commit -m "feat(scope): short summary" \
  -m "Detailed explanation of the grouped changes."
```

Example:

```bash
git commit -m "feat(auth): implement login and signup forms" \
  -m "Add LoginForm and SignupForm components, configure Zod validation schemas, and prepare placeholder actions for future Auth.js integration."
```

---

## Format for commits with a detailed list

When more detail is needed, the body may contain bullet points.

Example:

```bash
git commit -m "feat(packages): add shared workspace packages" \
  -m "Add shared packages for config, types, geo, db and ai." \
  -m "Expose app and auth configuration through @culturando/config." \
  -m "Define initial domain types through @culturando/types."
```

---

## Examples for Culturando

### Example 1 — Login form

```txt
feat(auth): implement login form
```

Optional body:

```txt
Add LoginForm component, connect shared auth copy, and prepare fields for email, password and remember me.
```

---

### Example 2 — Signup form

```txt
feat(auth): implement signup form
```

Optional body:

```txt
Add SignupForm component with name, email, password and confirm password fields.
```

---

### Example 3 — Zod validation

```txt
feat(auth): add zod validation schemas
```

Optional body:

```txt
Validate login and signup inputs using Zod and shared auth constraints from @culturando/config.
```

---

### Example 4 — Shared packages

```txt
feat(packages): add shared config and types packages
```

Optional body:

```txt
Create @culturando/config and @culturando/types workspace packages to centralize app metadata, auth constraints and domain types.
```

---

### Example 5 — Project context skill

```txt
docs(project): add Culturando architecture context
```

Optional body:

```txt
Document the project purpose, feature roadmap, monorepo structure and architectural conventions for future agents.
```

---

### Example 6 — Git commits skill

```txt
docs(git): add commit conventions skill
```

Optional body:

```txt
Document commit rules, status checks, Conventional Commit format and grouping strategy by project area.
```

---

### Example 7 — Multiple areas

If `git status` shows changes to:

```txt
apps/web/src/features/auth/*
packages/config/*
packages/types/*
docs/project-context.md
```

The agent must propose separate commits:

```txt
feat(auth): implement auth form structure
```

```txt
feat(packages): add shared config and domain types
```

```txt
docs(project): add architecture context skill
```

---

## Staging rule

Before making commits, the agent must avoid `git add .` if the changes belong to different areas and must be separated.

In these cases it must use selective staging:

```bash
git add apps/web/src/features/auth
git commit -m "feat(auth): implement auth form structure"
```

Then:

```bash
git add packages/config packages/types
git commit -m "feat(packages): add shared config and domain types"
```

Then:

```bash
git add docs/project-context.md
git commit -m "docs(project): add architecture context skill"
```

Use `git add .` only when all changes are part of the same logical commit.

---

## Rule on files not to include

The agent must be careful not to commit undesired files.

Always check whether the status contains:

```txt
node_modules/
.next/
.nx/
dist/
coverage/
.env
.env.local
.DS_Store
package-lock.json
```

These files must not be committed, except in specific and intentional cases.

In particular, the Culturando project uses pnpm, so `package-lock.json` must not be added.

---

## Package manager rule

The Culturando project uses pnpm.

The correct commands are:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm biome:check
pnpm biome:write
```

Do not use:

```bash
npm run dev
npm install
yarn
```

If npm generates files such as `package-lock.json`, the agent must flag it and propose its removal.

---

## Rule on checks before committing

When possible, before the commit the agent must suggest or run:

```bash
pnpm build
pnpm biome:check
```

If the change only concerns documentation, the build may not be necessary.

If the change concerns TypeScript, Next.js, packages or configurations, at least `pnpm build` is recommended.

---

## Agent output rule

When the user requests a commit, the agent must respond in this order:

1. show or request the output of `git status`;
2. classify the files by area;
3. suggest whether to make one or more commits;
4. propose the selective `git add` commands;
5. propose the commit message in Conventional Commit format;
6. suggest any checks before the commit.

---

## Operating template

When preparing a commit, use this scheme:

```txt
Status analysis:
- web/auth: ...
- packages/config: ...
- docs: ...

Suggested commits:
1. feat(auth): ...
2. feat(packages): ...
3. docs(project): ...

Commands:
git add ...
git commit -m "..."
```

---

## Complete operating example

Hypothetical input from `git status`:

```txt
modified: apps/web/src/features/auth/components/LoginForm.tsx
modified: apps/web/src/features/auth/components/SignupForm.tsx
modified: apps/web/src/features/auth/schemas/login.schema.ts
modified: packages/config/src/auth.config.ts
new file: packages/translation/src/index.ts
new file: docs/git-commits.md
```

Analysis:

```txt
auth:
- LoginForm
- SignupForm
- login schema

config:
- auth config

translation:
- initial translation package

docs:
- git commit skill
```

Suggested commits:

```bash
git add apps/web/src/features/auth
git commit -m "feat(auth): complete auth form validation"
```

```bash
git add packages/config/src/auth.config.ts packages/translation
git commit -m "feat(translation): add shared translation package foundation"
```

```bash
git add docs/git-commits.md
git commit -m "docs(git): add commit conventions skill"
```

---

## Final principle

A good commit must clearly answer three questions:

1. What type of change was made?
2. Which area of the project does it concern?
3. Which behavior, structure or documentation was introduced or modified?

Ideal example:

```txt
feat(auth): add zod validation for login and signup
```

It is clear because:

```txt
feat       → introduces a new feature
auth       → concerns the authentication area
message    → explains the concrete change
```

The agent must always prefer small, coherent and readable commits over large and generic ones.
