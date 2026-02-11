# Release v1.15.0: Viewshed Tool UX Overhaul

This release delivers a comprehensive UX refresh for the Viewshed Analysis tool, including visual theming, performance improvements, and critical bug fixes.

## ✨ Visual Enhancements

### Purple Theming

The Viewshed tool now features consistent **purple branding** (`#a855f7`) throughout:

- **Purple viewshed overlay** with transparency for better map readability
- **Purple distance slider** with dynamic progress fill showing the selected range
- **Purple "Recalculate Viewshed" button** with smooth hover effects

### Custom SVG Markers

- Replaced PNG marker icons with **inline SVG** for **instant rendering** (zero loading delay)
- Markers feature branded **cyan color** (`#00f2ff`) with drop shadows for visual depth
- No more waiting for marker assets to load when placing points

### Dark Glassmorphism Theme

All Leaflet UI elements now use custom **dark glassmorphism** styling:

- **Popups and tooltips** with dark background (`rgba(10, 10, 18, 0.95)`)
- **Neon cyan borders** and subtle glow effects
- **Backdrop blur** for a modern, professional aesthetic
- Fully integrated with the application's cyberpunk design language

### Improved Animations

- **Guidance overlays** now use `slideUp` animation (0.3s ease-out) instead of `fadeIn`
- More contextually appropriate for bottom-anchored floating panels
- Smoother, more polished user experience

## 🐛 Critical Bug Fixes

### Recalculate Button

Fixed a critical bug where the "Recalculate Viewshed" button was completely non-functional:

- **Root cause**: Function signature mismatch in `runViewshedAnalysis`
- **Solution**: Updated function to accept both object pattern `({lat, lng}, maxDist)` and individual pattern `(lat, lng, height, maxDist)`
- Users can now adjust the distance slider and click "Recalculate" to update the viewshed overlay

### Marker Drag Behavior

- Corrected the viewshed marker's `dragend` event handler
- Now properly triggers new analysis when markers are moved
- Parameters are passed correctly to the analysis engine

### Click-Through Issue

- Fixed pointer-events on the ViewshedControl floating panel
- Map interactions (pan, zoom, click) now work properly even when the panel is visible

### Module Import Warning

- Resolved ES6 module import order warning in `useViewshedTool.js`
- All imports are now at the top of the file per JavaScript module standards

## ⚙️ Configuration Updates

- **Default Antenna Height**: Increased from 5 meters to **9.144 meters (30 feet)** for more realistic baseline scenarios

## 🧹 Code Cleanup

- Removed redundant "Viewshed Observer" tooltip (was redundant with popup)
- Cleaned up all debug console logs added during troubleshooting
- Improved code organization and readability

---

## Developer Notes

This release focused on polish and bug fixes for the Viewshed tool. The custom SVG markers and dark theme styling apply globally to all map markers and Leaflet UI components, improving consistency across the entire application.

The function signature fix for `runViewshedAnalysis` ensures compatibility with multiple calling patterns, making the API more flexible for future enhancements.
