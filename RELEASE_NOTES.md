# Release v1.14.3: Neon Aesthetics & Backend Regression Fixes

This release focuses on verifying the stability of the Multi-Site Analysis tool and aligning its visual output with the application's "Classic Cyberpunk" aesthetic.

## 🎨 Aesthetics & Branding

- **Neon Cyan Coverage**: The Multi-Site coverage overlay now renders in glowing **Neon Cyan** (`#00f2ff`) with transparency, replacing the previous monotone texturing. This ensures the coverage map feels like an integrated part of the UI rather than a separate layer.

## 🐛 Bug Fixes

- **Multi-Site Zero Coverage**: Fixed a critical backend regression where type mismatches (strings vs floats) caused the viewshed engine to return empty results for all sites.
- **Frontend Crash**: Resolved an `Invalid LatLng` exception by ensuring the Python backend returns bounding boxes in the format expected by the React frontend (`{north, south, east, west}`).
- **Invisible Overlay**: Fixed a rendering issue where the composite coverage map was calculated but never displayed on the canvas.

---

# Release v1.14.2: UI Polish & Documentation Sync

This release fixes a persistent issue where a purple background box could still appear during Multi-Site Analysis and updates the project documentation to mirror the recent mesh planning advancements.

## Bug Fixes

- **Final UI Cleanup**: Fixed a condition where the viewshed's purple "shadow" overlay would persist on the map during optimization scans. Map readability is now fully restored.

## Documentation Updates

- **README Sync**: The main project documentation now fully reflects the v1.14 features:
  - Inter-Node Link Matrix details.
  - Marginal Coverage analysis metrics.
  - Mesh Topology and connectivity scoring.
  - Updated propagation model guidance.

---

_For the major mesh planning features introduced in v1.14.0, please refer to the corresponding release notes._
