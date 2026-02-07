# Code Review & Cleanup Plan

## Goal

Remove unused code (Frontend/Backend) and report duplicates.

## Tasks

- [x] **Frontend Audit**: Run `docker exec meshrf_dev npx knip` to find unused exports/files.
- [x] **Backend Audit**: Run `docker exec -it rf_engine_dev pip install vulture && docker exec -it rf_engine_dev vulture .` to find dead Python code.
- [x] **Asset Cleanup**: Check `public/` manually (host is fine for file listing).
- [x] **Duplicate Report**: Run `docker exec meshrf_dev npx jscpd src` (report only).
- [x] **Cleanup**: Delete confirmed unused files/code.
- [x] **Verify**: Run `docker exec meshrf_dev npm run build`.

## Done When

- [x] Unused items deleted.
- [x] Duplicates reported.
- [x] Build passes.
