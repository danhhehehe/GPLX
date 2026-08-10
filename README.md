# GPLX — Open-Source Vietnamese Driving License Learning Platform

GPLX is an open-source full-stack learning platform for Vietnamese driving-license theory and road-safety practice. It combines structured question practice, critical-question training, traffic-sign learning, license-specific mock exams, scoring, statistics, and a reusable backend API.

The project is designed as both a learner-facing website and a maintainable software/data pipeline: the frontend consumes the backend API, while the backend handles import, normalization, duplicate detection, validation, exam generation, and scoring.

> **Project status:** active early-stage development. Interfaces, datasets, and deployment details may change before a stable release.

## Highlights

- Practice by license class and question category
- Critical / point-deduction question practice
- Questions with images and explanations
- Traffic-sign browser and grouped sign data
- License-specific mock exam generation and scoring
- Statistics endpoints and learning-oriented views
- MongoDB-backed normalized data model
- SHA-256-based duplicate handling during question import
- Separate React/Vite frontend and Node/Express backend
- GitHub Pages frontend deployment workflow
- Security middleware including Helmet, rate limiting, validation, and Mongo query sanitization

## Current verified dataset snapshot

The project's current seed/validation workflow reports:

```text
questions: 600
A/A1: 250
all: 600
critical questions: 60
questions with images: 318
traffic signs: 231
traffic-sign groups: 5
license classes: 15
```

These counts describe a current project snapshot, not a guarantee about future upstream datasets.

## Architecture

```text
Browser
  ↓
React + Vite frontend
  ↓ HTTP/JSON
Node.js + Express API
  ↓
Mongoose
  ↓
MongoDB
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for more detail.

## Tech stack

- **Frontend:** React, Vite, Axios, React Router
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **CI/CD:** GitHub Actions, GitHub Pages

## Quick start

### Requirements

- Node.js 20+
- npm
- MongoDB available locally or through a configured connection string

### Install

macOS/Linux:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm install
npm run install:all
```

Windows Command Prompt:

```bat
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm install
npm run install:all
```

### Run development servers

```bash
npm run dev
```

Default local services:

```text
Backend:  http://localhost:5000
Frontend: http://localhost:5173
MongoDB:  mongodb://127.0.0.1:27017/gplx_db
```

## Data import and validation

Useful backend commands include:

```bash
npm run seed
npm run seed:all
npm run seed:traffic-signs
npm run seed:licenses
npm run seed:exam-sets
npm run validate:exams
npm run fix:duplicates
```

The importer normalizes records, creates SHA-256-based identifiers for duplicate handling, merges compatible metadata, normalizes image URLs, and prepares collections used by the application.

### Data provenance

GPLX references external learning-data sources. **The MIT license in this repository covers GPLX-maintained software; it does not automatically grant rights to third-party datasets, images, trademarks, or website content.**

See [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) before redistributing imported data or adding a new source.

Currently referenced upstream resources include content hosted by `onthigplx.edu.vn`. Their availability and applicable terms are controlled by the upstream publisher, not this repository.

## Main API surface

### Questions

```text
GET /api/questions
GET /api/questions/a1
GET /api/questions/all
GET /api/questions/:id
GET /api/questions/license/:type
GET /api/questions/categories
GET /api/questions/point-deduction
GET /api/questions/with-images
GET /api/questions/no-images
GET /api/questions/image-check
GET /api/questions/statistics
```

### Exams

```text
GET  /api/exam/a1
GET  /api/exam/:licenseType
GET  /api/exam/sets?licenseType=A1
POST /api/exam/create
POST /api/exam/submit
```

### Traffic signs

```text
GET /api/traffic-signs
GET /api/traffic-signs/groups
GET /api/traffic-signs/statistics
GET /api/traffic-signs/:code
GET /api/traffic-signs/group/:groupSlug
```

### License classes

```text
GET  /api/licenses
GET  /api/licenses/statistics
GET  /api/licenses/:code
POST /api/licenses/refresh
```

## Frontend routes

```text
/
/licenses
/questions
/questions?licenseType=B
/questions-with-images
/practice/a1
/exam
/exam/:licenseType
/exam/:licenseType/session
/exam/result
/point-deduction
/traffic-signs
/statistics
```

## Open-source maintenance goals

GPLX aims to improve reliability and maintainability through automated checks, reproducible validation, tests for exam/scoring behavior, explicit data provenance, accessible learning flows, and human-reviewed contributions.

The public roadmap is in [ROADMAP.md](ROADMAP.md).

## Contributing

Contributions are welcome, especially for:

- bug fixes and regression tests;
- API and architecture documentation;
- accessibility improvements;
- exam-generation and scoring validation;
- data-quality/provenance tooling;
- deployment and reliability improvements.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Security issues should follow [SECURITY.md](SECURITY.md).

## License

GPLX-maintained source code is licensed under the [MIT License](LICENSE).

Third-party datasets and media remain subject to their own rights and terms. See [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md).
