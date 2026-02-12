# Release v1.15.1: Viewshed Stability & Dynamic Grid

This patch release addresses critical rendering bugs in the Viewshed tool and implements a new **Dynamic Grid Stitching** engine to support long-range analysis without clipping.

## 🚀 Key Improvements

### Dynamic Grid Sizing (No More Clipping)

Previously, the viewshed tool was limited to a fixed 3x3 tile grid (approx. 30km radius), causing the analysis to be "cut off" at the edges for long-distance calculations.

- **New Logic**: The engine now acts intelligently, calculating exactly how many elevation tiles are needed to cover your requested radius.
- **Result**: Whether you scan 10km or 100km, the system automatically fetches and stitches a 5x5, 7x7, or larger grid to ensure **zero clipping**.

### Visual Clarity

- **Shadows Removed**: We found that rendering obstructed areas as "faint purple" was confusing. We have **disabled shadow rendering**, so obstructed areas are now fully transparent. This makes the "True Coverage" stand out clearly against the dark map.
- **Radius Adjustment**: Default Multi-Site scan radius set to **7.5 km**, offering 50% more range than before while maintaining fast scan times.
- **Radius Boundary**: A **Cyan Dashed Circle** now appears around the observer, showing you exactly where the calculation limit is.

### Stability Fixes

- **Crash Fix**: Resolved a generic "React Error" that would occur when placing the Viewshed marker rapidly.
- **Height Persistence**: Fixed a bug where moving the marker would reset your custom Antenna Height to the default 2m.
- **Slider Fix**: The "Recalculate" button now reliably respects the Distance Slider value instead of reverting to defaults.

## 🛠️ UI Polish

- **Progress Bar**: The progress bar now turns **Neon Green** and fills to 100% when the calculation finishes, giving better feedback.

---

## Upgrade Instructions

No special actions required. This is a frontend-only update.
