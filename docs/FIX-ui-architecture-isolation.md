# Fix: UI Architecture Isolation (Map Event Bubbling)

## Issue

Clicks on UI elements (sliders, checkboxes, panels) rendered inside the `react-leaflet` `MapContainer` were bubbling up to the map instance, triggering unintended interactions like placing markers or clearing selections while the user was simply trying to adjust settings.

## Solution: Panel Isolation

The core solution was to move all interactive UI panels **outside** of the `<MapContainer>` JSX block.

### Before

```jsx
<MapContainer ...>
  <TileLayer ... />
  <SiteAnalysisPanel ... /> {/* INSIDE: Clicks bubble to map */}
</MapContainer>
```

### After

```jsx
<div className="map-wrapper">
  <MapContainer ...>
    <TileLayer ... />
    <MapInstanceTracker setMap={setMap} /> {/* Capture map instance */}
  </MapContainer>

  <SiteAnalysisPanel ... /> {/* OUTSIDE: Isolated from map events */}
</div>
```

## Key Pattern: `MapInstanceTracker`

Since the UI panels are now outside the map context, they cannot use the `useMap()` hook directly. We implemented a `MapInstanceTracker` component inside the container to capture the Leaflet instance and share it back to the parent:

```javascript
const MapInstanceTracker = ({ setMap }) => {
  const map = useMap();
  React.useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);
  return null;
};
```

This allows the parent `MapComponent` to maintain a `map` reference in state, which can be passed to external panels for actions like `map.flyTo()`.

## Status

- **Implemented**: `MapContainer.jsx` refactored.
- **Verified**: Clicks on Site Analysis and Link Analysis panels no longer trigger map events.
