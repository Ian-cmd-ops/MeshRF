import React from 'react';

const LinkProfileChart = ({ profileWithStats, width = 200, height = 100, units = 'metric' }) => { // Added units default
    if (!profileWithStats || profileWithStats.length === 0) return null;

    // Unit Conversion Helpers
    const isImperial = units === 'imperial';
    const distFactor = isImperial ? 0.621371 : 1;
    const heightFactor = isImperial ? 3.28084 : 1;
    const distUnit = isImperial ? 'mi' : 'km';
    const heightUnit = isImperial ? 'ft' : 'm';

    // Determine scales (in native metric for drawing, converted for labels)
    const minElev = Math.min(...profileWithStats.map(p => p.elevation));
    const maxElev = Math.max(...profileWithStats.map(p => p.losHeight), ...profileWithStats.map(p => p.elevation));
    const totalDist = profileWithStats[profileWithStats.length - 1].distance;

    // Label Values
    const totalDistLabel = (totalDist * distFactor).toFixed(1);
    const maxElevLabel = (maxElev * heightFactor).toFixed(0);

    // Padding
    const p = 5;
    const w = width - p * 2;
    const h = height - p * 2;

    const scaleX = (d) => p + (d / totalDist) * w;
    const scaleY = (e) => height - p - ((e - minElev) / (maxElev - minElev)) * h;

    // Generate Path Data
    // 1. Terrain Polygon (filled)
    let terrainPath = `M ${scaleX(0)} ${height}`; // Start bottom left
    profileWithStats.forEach(pt => {
        terrainPath += ` L ${scaleX(pt.distance)} ${scaleY(pt.elevation)}`;
    });
    terrainPath += ` L ${scaleX(totalDist)} ${height} Z`; // Close to bottom right

    // 2. LOS Line
    const losPath = `M ${scaleX(0)} ${scaleY(profileWithStats[0].losHeight)} L ${scaleX(totalDist)} ${scaleY(profileWithStats[profileWithStats.length - 1].losHeight)}`;

    // 3. Fresnel Zone (Bottom) Line
    // F1 Bottom = LOS - F1 Radius
    let f1Path = "";
    profileWithStats.forEach((pt, i) => {
        const f1Bottom = pt.losHeight - pt.f1Radius;
        const cmd = i === 0 ? 'M' : 'L';
        f1Path += `${cmd} ${scaleX(pt.distance)} ${scaleY(f1Bottom)}`;
    });

    return (
        <div style={{ marginTop: '10px', background: '#0000', border: '1px solid #333', borderRadius: '4px' }}>
            <svg width={width} height={height}>
                {/* Terrain */}
                <path d={terrainPath} fill="#444" stroke="none" opacity="0.6" />
                
                {/* Fresnel Zone Bottom Limit */}
                <path d={f1Path} fill="none" stroke="#00f2ff" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />

                {/* LOS Line */}
                <path d={losPath} fill="none" stroke="#00ff41" strokeWidth="2" />

                {/* Axis Labels (Simplified) */}
                <text x={p} y={height - 2} fill="#888" fontSize="8">0{distUnit}</text>
                <text x={width - 25} y={height - 2} fill="#888" fontSize="8">{totalDistLabel}{distUnit}</text>
                <text x={p} y={p + 8} fill="#888" fontSize="8">{maxElevLabel}{heightUnit}</text>
            </svg>
        </div>
    );
};

export default LinkProfileChart;
