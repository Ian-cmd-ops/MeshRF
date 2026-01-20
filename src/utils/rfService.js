const API_URL = '/api';

export const optimizeLocation = async (bounds, freq, height) => {
    // bounds: { _southWest: { lat, lng }, _northEast: { lat, lng } } or similar Leaflet bounds
    const min_lat = bounds.getSouth();
    const max_lat = bounds.getNorth();
    const min_lon = bounds.getWest();
    const max_lon = bounds.getEast();

    try {
        const response = await fetch(`${API_URL}/optimize-location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                min_lat: Number(min_lat),
                min_lon: Number(min_lon),
                max_lat: Number(max_lat),
                max_lon: Number(max_lon),
                frequency_mhz: Number(freq),
                height_meters: Number(height)
            })
        });
        const initialData = await response.json();
        return initialData;
    } catch (error) {
        console.error("Optimize Error:", error);
        throw error;
    }
};
