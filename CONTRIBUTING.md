# Contributing to GPLX

Thanks for helping improve GPLX. The project welcomes bug reports, documentation improvements, tests, accessibility fixes, data-quality checks, and well-scoped feature contributions.

## Before opening a pull request

1. Search existing issues and pull requests to avoid duplicates.
2. For non-trivial changes, open an issue first and describe the problem and proposed approach.
3. Keep pull requests focused on one concern.
4. Do not add scraped or third-party data unless its source, terms, and attribution are documented.

## Local development

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm install
npm run install:all
npm run dev
```

On Windows Command Prompt, use `copy` instead of `cp`.

Default services:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: mongodb://127.0.0.1:27017/gplx_db

## Quality checks

Before submitting a pull request, run:

```bash
npm run build
npm run check
```

If your change affects exam generation or imported data, also run the relevant validation/seed command documented in `README.md`.

## Pull request expectations

A good pull request should include:

- a clear problem statement;
- a concise explanation of the solution;
- screenshots for visible UI changes;
- tests or validation steps when practical;
- documentation updates for changed behavior or APIs;
- no secrets, credentials, personal data, or unlicensed third-party content.

## Commit messages

Prefer short conventional-style messages such as:

- `fix: handle invalid license code`
- `feat: add traffic-sign filtering`
- `docs: document exam API`
- `test: cover exam validation rules`

## Data contributions

GPLX source code is licensed separately from third-party datasets. Data additions must identify the original source and applicable usage terms. Do not assume public availability means open licensing.

## Code of conduct

Participation in this project is governed by `CODE_OF_CONDUCT.md`.
