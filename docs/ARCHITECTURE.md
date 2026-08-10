# Architecture

GPLX is a small full-stack application with a React/Vite frontend, an Express/Mongoose backend, and MongoDB persistence.

## Components

```text
Browser
  │
  ▼
React + Vite frontend
  │ HTTP / JSON
  ▼
Express API
  ├─ validation/security middleware
  ├─ controllers and routes
  ├─ exam/scoring logic
  ├─ import/normalization scripts
  └─ Mongoose models
        │
        ▼
      MongoDB
```

## Frontend

The frontend is responsible for navigation, practice/exam interaction, presenting questions and explanations, traffic-sign browsing, and statistics views. It should treat the backend API as the source of application data.

## Backend

The backend exposes APIs for questions, exams, traffic signs, license classes, and supporting learning features. Cross-cutting middleware handles input validation, security headers, rate limiting, MongoDB query sanitization, CORS, and error handling.

## Data pipeline

Seed/import scripts fetch permitted upstream data, normalize records, merge duplicates, and write structured MongoDB collections. Data provenance and redistribution considerations are documented in `docs/DATA_SOURCES.md`.

## Deployment

The frontend can be built as static assets and deployed to GitHub Pages. The backend is separately deployable as a Node service and requires MongoDB plus environment configuration.

## Design goals

- Keep frontend and data ingestion separated.
- Validate user-controlled API inputs.
- Make exam generation and scoring deterministic enough to test.
- Keep third-party data provenance explicit.
- Prefer small, reviewable changes with human review before merge.
