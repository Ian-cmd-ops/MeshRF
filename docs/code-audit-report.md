# Code Audit Report

## 1. Unused Files & Code

**Status:** Found 22 potentially unused files.

### 🔴 Safe to Delete/Ignore (Build Artifacts)

These files appear to be generated build artifacts or temp files.

- `dev-dist/` contents (`sw.js`, `registerSW.js`, `workbox-*.js`)
- `libmeshrf/build_wasm/` contents

### 🟡 Candidates for Deletion

- `scripts/test_rf_math.mjs`: Appears to be a manual test script, not used in main app or standard tests.
- `src/utils/rfMath.js`: Export `calculateEarthBulge` (lines 164) is unused.

### 🟢 False Positives (KEEP)

- `public/env-config.js`: **USED** in `index.html` (line 22). Do not delete.
- `rf-engine/server.py`: All identified "unused" functions are **USED** as FastAPI route handlers.

## 2. Dependencies

- **Unused:** `@deck.gl/geo-layers`, `geotiff` (Package.json).
  - _Recommendation:_ Remove from `package.json` if verified.

## 3. Duplication (Copy-Paste)

**Status:** 31 Duplication Clones found.

- **Top Offender:** `src/components/Map/UI/MapToolbar.jsx`
  - Multiple repeated blocks (16 lines each) for toolbar buttons/handlers.
  - _Recommendation:_ Refactor into a reusable `<ToolbarButton />` component.

## 4. Backend (Python)

- `optimization_service.py`: Unused import `maximum_filter`.
- `server.py`: Unused import `HTTPException`.

## Action Plan

1. Add `dev-dist/` and `libmeshrf/build_wasm/` to `.gitignore`.
2. Delete `scripts/test_rf_math.mjs`.
3. Remove unused Python imports.
4. Refactor `MapToolbar.jsx`.
