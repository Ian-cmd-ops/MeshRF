# Release v1.9.1: The "Neon Polish" Update 🎨

This maintenance release focuses on UI consistency and codebase hygiene. We've tightened the aesthetic integration of map elements and added requested unit conversion features.

## 🌟 Key Changes

### 1. 📏 Unit Conversions

- **Metric/Imperial Toggle**: Site analysis results (elevation, coverage area) now respect your global unit settings.
  - Elevation: Meters ↔ Feet
  - Area: km² ↔ mi²

### 2. 🎨 Dark/Neon Theming

- **Map Popups**: Default white Leaflet popups have been replaced with **Dark Glassmorphism** panels (`#0a0a0f` bg) featuring neon cyan borders and glow effects.
- **High-Vis Markers**: Optimization candidate nodes and "Ideal Spots" are now rendered in **Solid Cyan** (`#00f2ff`) to stand out against satellite imagery.

### 3. 🏗️ Site Finder & Multi-Site Refactor

- **Ergonomics**: The Site Selection Weights panel has been completely rebuilt with a responsive grid layout, larger touch targets for sliders, and improved label legibility.
- **Multi-Site Tab**: New dedicated interface for managing multiple candidate sites (`NodeManager`). Toggle between "Elevation Scan" (Auto) and "Multi-Site" (Manual) modes instantly.
- **Performance**: Decoupled the analysis state from the main map event loop, eliminating "ghost clicks" where interacting with UI controls would accidentally place markers on the map.

### 4. 🧹 Codebase Cleanup

- **Dead Code Removal**: Pruned unused `ViewshedLayer.js` (replaced by Wasm) and unused Python imports.
- **Console Silence**: Removed verbose debug logging from the viewshed engine for a cleaner developer console.
- **Docker Standards**: Formalized "Docker-First" development rules in the repository documentation.

## 🚀 How to Upgrade

1. Pull changes: `git pull origin main`
2. **Rebuild Containers** (for backend cleanup): `docker compose -f docker-compose.dev.yml up -d --build`
