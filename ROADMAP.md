# GPLX Roadmap

GPLX is an open-source Vietnamese driving-license and road-safety learning platform. This roadmap is directional; priorities may change as regulations, data sources, and community needs evolve.

## v0.1 — Open-source foundation

- [x] Public full-stack application
- [x] Question, exam, traffic-sign, and license APIs
- [x] Data normalization and duplicate handling
- [x] GitHub Pages frontend deployment
- [ ] Add repeatable CI checks for backend and frontend
- [ ] Establish contribution, security, and data-source documentation
- [ ] Publish the first tagged release

## v0.2 — Reliability and testing

- [ ] Add automated tests for exam creation and scoring
- [ ] Add API contract tests for core read endpoints
- [ ] Add regression tests for question normalization and duplicate detection
- [ ] Add validation fixtures that do not require external websites
- [ ] Improve error handling and observability

## v0.3 — Data quality and provenance

- [ ] Document provenance and usage terms for each imported dataset
- [ ] Add data-source health checks
- [ ] Add import reports showing added, changed, skipped, and invalid records
- [ ] Add deterministic dataset snapshots where redistribution is permitted
- [ ] Detect upstream schema changes before they break imports

## v0.4 — Accessibility and learning experience

- [ ] Keyboard-first practice and exam flows
- [ ] Improve screen-reader semantics and focus states
- [ ] Add clearer explanations for incorrect answers
- [ ] Improve mobile performance and low-bandwidth behavior
- [ ] Add learning-progress features that preserve user privacy

## Maintainer automation

We are interested in responsible automation for repetitive open-source maintenance work, including issue triage, regression-test generation, pull-request review assistance, documentation checks, and release preparation. Human review remains required before changes are merged.

## Contributing

See `CONTRIBUTING.md`. Please open an issue before starting a large roadmap item so scope and data/licensing constraints can be discussed first.
