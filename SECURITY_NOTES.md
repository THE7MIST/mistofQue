# Security Notes

## Frontend-only quiz integrity

Severity: Medium

The browser must download quiz questions and correct answers to score and review attempts. A determined user can inspect bundled JSON, manipulate local state, alter the timer, or forge local result records. This is acceptable for practice, but not for high-stakes exams.

Recommendation: For graded exams, issue server-side attempt IDs, store answers server-side, calculate scores on the backend, and return only review data after final submission.

## localStorage session and progress trust

Severity: Medium

Authentication state, attempts, progress, and badges are stored in browser storage. This preserves user progress and supports offline practice, but localStorage is user-controlled and vulnerable to tampering or theft if XSS is introduced.

Recommendation: Use short-lived server sessions or HttpOnly cookies for privileged features. Treat localStorage progress as convenience data, not authoritative records.

## Google Apps Script API hardening

Severity: Medium

The frontend can call Apps Script directly, so Apps Script must independently validate every request. Frontend restrictions such as demo read-only mode should not be considered sufficient authorization.

Recommendation: Validate action names, user identity, payload shape, numeric ranges, and active status server-side. Add idempotency keys for result saves, basic rate limiting, replay protection where practical, and reject unknown fields.

## Public endpoint configuration

Severity: Low

The deployed Apps Script URL is public in the frontend bundle. This is expected for a client-side app, but the endpoint should not rely on obscurity.

Recommendation: Keep all secrets out of Vite environment variables and enforce authorization and validation in Apps Script.
