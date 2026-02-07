# Graphic Identity & UI Style Guide

This document defines the visual standards for the MeshRF project. All new UI components must strictly adhere to these guidelines to ensure consistency.

## 1. Core Philosophy

**"Cyberpunk Utility"**

- **Dark & Deep**: Backgrounds are nearly black to reduce eye strain and make data pop.
- **Neon Accents**: Cyan (`#00f2ff`) is the primary action color. Green (`#00ff41`) indicates success/LOS. Red (`#ff0000`) indicates obstruction/error.
- **Glassmorphism**: UI panels float above the map with high transparency and blur, maintaining context.

## 2. Color Palette

### Primary Colors

- **Cyan (Primary Action)**: `#00f2ff`
- **Deep Space (Background)**: `rgba(10, 10, 15, 0.98)`
- **Text (Primary)**: `#eee` or `#fff`
- **Text (Secondary)**: `#888` or `#aaa`

### Status Colors

- **Success / LOS**: `#00ff41`
- **Warning / Marginal**: `#ffbf00`
- **Error / Obstructed**: `#ff0000` or `#ff4444`

## 3. UI Component Standards

### Panels & Containers

All floating panels must use inline styles (until a CSS system is adopted) matching:

```javascript
const panelStyle = {
  background: "rgba(10, 10, 15, 0.98)",
  backdropFilter: "blur(16px)",
  border: "1px solid #00f2ff33", // Low opacity cyan border
  borderRadius: "8px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
  color: "#eee",
  fontFamily: "system-ui, sans-serif",
};
```

### Buttons (Primary)

```javascript
const buttonStyle = {
  background: "rgba(0, 242, 255, 0.15)", // Low opacity fill
  border: "1px solid #00f2ff", // Solid border
  color: "#00f2ff", // Neon text
  textTransform: "uppercase",
  fontWeight: "bold",
  letterSpacing: "1px",
  cursor: "pointer",
  transition: "all 0.2s",
};
// Hover: Increase background opacity and box-shadow
```

### Inputs

- **Background**: `rgba(0, 0, 0, 0.3)`
- **Border**: `1px solid #333` (Active: `#00f2ff`)
- **Font**: Monospace for coordinates/data.

## 4. Typography

- **Headings**: System Sans-Serif, Uppercase, Bold, Cyan/White.
- **Data/Coordinates**: Monospace.
- **Body**: System Sans-Serif.

## 5. Implementation Rule

Since the project does NOT use Tailwind or external UI libraries:

1.  **Do NOT use class names** for layout (e.g., `flex`, `p-4`).
2.  **Use React Inline Styles** (`style={{ ... }}`) for all dynamic UI.
3.  **Use `<style>` blocks** only for animations (keyframes) or pseudo-elements (scrollbars).
