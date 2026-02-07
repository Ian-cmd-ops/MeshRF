# Implementation Plan - Unified Site Finder Tool

## Goal

Merge the "Multi-Site" tool (NodeManager) into the "Site Finder" tool (Optimization) as a sub-mode. The user will click "Site Finder" and be able to toggle between:

1.  **Auto-Optimizer** (Existing Site Finder / Genetic Algorithm)
2.  **Multi-Site Analysis** (Existing Node Manager)

This reduces toolbar clutter and groups related functionality.

## Proposed Changes

### 1. `src/components/Map/UI/MapToolbar.jsx`

- Remove the "Multi-Site" (Scan) button.
- Keep "Site Finder" (Optimize) button.

### 2. `src/components/Map/MapContainer.jsx`

- Lift state for `siteFinderMode` ('auto' | 'manual').
- Remove the direct rendering of `NodeManager` based on `toolMode === 'scan'`.
- Pass `siteFinderMode` settings to a new wrapper component or handle conditional rendering directly.
- Ensure `OptimizationLayer` is only active when `toolMode === 'optimize'` AND `siteFinderMode === 'auto'`.

### 3. New Component: `src/components/Map/UI/SiteFinderPanel.jsx`

- A new container component that renders when `toolMode === 'optimize'`.
- **Features**:
  - Tab/Toggle Switcher at the top: [Auto-Find] | [Multi-Site].
  - **Auto-Find Tab**: Renders `SiteSelectionSettings` (logic).
  - **Multi-Site Tab**: Renders `NodeManager` (logic).
- **Styling**:
  - Use the "Cyberpunk Utility" theme.
  - Handle positioning (top-right or top-center) so it replaces the individual panels.

### 4. Component Updates

- **`NodeManager.jsx`**:
  - Accept `style` prop to allow parent to control positioning (or just update default position to match Site Finder).
  - Ensure it fits within the new container.
- **`SiteSelectionSettings.jsx`**:
  - Convert to a "dumb" component that renders inside the panel, or adapting it to fit.

## Verification Plan

### Manual Verification

1.  **Toolbar Check**:
    - Verify "Multi-Site" button is gone.
    - Verify "Site Finder" button exists.
2.  **Mode Switching**:
    - Click "Site Finder".
    - Verify the new Panel appears.
    - Check default mode (Auto or Manual).
    - Switch tabs. Verify content changes.
3.  **Functionality**:
    - **Auto Mode**: Verify sliders change weights and `OptimizationLayer` updates on map.
    - **Manual Mode**: Verify adding nodes works, coverage scan works.
4.  **Map Interaction**:
    - Ensure map clicks for "Auto" (setting bounds/points) don't conflict with "Manual" (adding nodes). _Note: Auto mode usually requires a start/end point selection. Manual requires clicking to add nodes._
    - We need to ensure `setEditMode` or similar map event handlers are properly toggled when switching tabs.
