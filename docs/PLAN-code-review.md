# Code Review & Cleanup Plan

## Goal

Remove unused code (Frontend/Backend) and report duplicates.

## Tasks

- [ ] **Frontend Audit**: Run `npx knip` (dry-run) to find unused exports/files.
- [ ] **Backend Audit**: Run `vulture rf-engine/` to find dead Python code.
- [ ] **Asset Cleanup**: Check `public/` for unused media.
- [ ] **Duplicate Report**: Run `jscpd src rf-engine` (report only).
- [ ] **Cleanup**: Delete confirmed unused files/code.
- [ ] **Verify**: Run `npm run build` and tests.

## Done When

- [ ] Unused items deleted.
- [ ] Duplicates reported.
- [ ] Build passes.
