# ServeCircle AI Work Protocol

Use this file whenever an AI starts, resumes, or hands off work in this repository.

## Start protocol

1. Read `docs/AI_START_HERE.md`.
2. Read `docs/PROJECT_STATE.md`.
3. Read the relevant section of `docs/ROLE_WORKFLOW_SERVICE_AUDIT.md`.
4. Read `docs/IMPLEMENTATION_ROADMAP.md` and select one next slice.
5. Check `git status --short`; preserve unrelated user changes.
6. Inspect the owning code path and one nearby test/call site.
7. State a falsifiable local hypothesis and a focused validation command.

## Change protocol

- Make the smallest coherent change.
- Prefer existing patterns and API contracts.
- Keep service identity separate from display text.
- Keep event management separate from ordinary bookings.
- Use `server/constants/bookingStates.js` as the booking status source of truth.
- Use dedicated booking lifecycle endpoints for status changes.
- Enforce authorization on both API and client navigation.
- Never use fake timers, demo IDs, or local mock data as the primary success path after a real API path exists.
- Do not expose secrets, tokens, private data, or `.env` values.
- Do not move runtime roots or deployment files casually.
- Do not delete speculative code without checking imports, routes, history, and product intent.

## Validation protocol

Run the narrowest relevant command first:

- Web change: `Set-Location client; npm run build`
- Tool JavaScript change: `node --check path/to/file.js`
- Backend route/service change: focused server test, then broader tests if available.
- Catalog change: catalog endpoint/read validation plus booking validation.
- Workflow change: role access and state-transition tests.
- Documentation-only change: verify links, headings, and referenced files.

## Handoff/update protocol

After every meaningful change:

1. Update `docs/PROJECT_STATE.md` if current verified behavior changed.
2. Add one entry to `docs/CHANGELOG.md` with date, change, files, validation, and remaining risk.
3. Update `docs/IMPLEMENTATION_ROADMAP.md` if task status or acceptance criteria changed.
4. Update `docs/ROLE_WORKFLOW_SERVICE_AUDIT.md` when role/service/workflow truth changes.
5. Keep `docs/PROJECT_CONTEXT_REPORT.md` for stable architecture/inventory facts, not session narration.

## Required changelog entry format

```md
## YYYY-MM-DD - Short change title

- Changed: what behavior or structure changed.
- Files: important paths.
- Validation: exact command and result.
- Remaining risk: what is still unverified.
```

## Stop conditions

Stop and report instead of guessing when:

- A required external credential/provider is missing.
- A migration could change production data without a rollback plan.
- Existing user changes conflict with the requested change.
- The API contract and UI requirement disagree and the correct behavior is ambiguous.
- A broad delete/rewrite is requested without classification or validation.

## Documentation language

Always distinguish these words:

- `implemented`: source path and focused validation prove it.
- `partially integrated`: some real path exists but mock/static or contract gaps remain.
- `planned`: documented design, not implemented.
- `demo`: UI behavior intentionally simulated.
- `unknown`: not verified.
