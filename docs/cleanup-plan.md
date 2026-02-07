# cleanup-plan.md

## Goal

Remove unnecessary debug logging (`console.log`) from production React code and document technical debt.

## Findings

### 1. Excessive Console Logging (Debug Noise)

The following files contain debug logging that should be removed for production:

- **Map Components**:
  - `src/components/Map/MapContainer.jsx` (Multiple logs: "Triggering RF Recalculation", "Viewshed Debug")
  - `src/components/Map/Controls/CoverageClickHandler.jsx` (RF Params logging)
  - `src/components/Common/UpdatePrompt.jsx` (SW registration)

- **Hooks (Heavy Logging)**:
  - `src/hooks/useViewshedTool.js` (Worker status, stitched grid stats)
  - `src/hooks/useRFCoverageTool.js` (Wasm module loaded, analysis params, signal stats)

### 2. Technical Debt (TODOs)

- `opentopodata/opentopodata/api.py`: `TODO: drop the dependency on flask_caching` (Low priority, architectural)

### 3. Libs (Ignore)

- `libmeshrf/js/Worker.ts`: Logs inside the worker wrapper. (Useful for debugging the worker itself, maybe keep?)

## Proposed Actions

1.  **[REMOVE]** All `console.log` statements in `src/components/` and `src/hooks/`.
2.  **[KEEP]** Logs in `libmeshrf/` (Low level debug).
3.  **[IGNORE]** `opentopodata` TODO (Out of scope for this cleanup).

## Verify

- Run `npm run build` to ensure no syntax errors.
- Manual check of browser console to ensure it's clean.
