import React from 'react';
import LinkProfileChart from './LinkProfileChart';

const LinkAnalysisPanel = ({ nodes, linkStats, budget, distance, units }) => { // added units prop
    if (nodes.length !== 2) return null;

    // Conversions
    const isImperial = units === 'imperial';
    const distDisplay = isImperial ? (distance * 0.621371).toFixed(2) + ' mi' : distance.toFixed(2) + ' km';
    const clearanceVal = linkStats.minClearance;
    const clearanceDisplay = isImperial ? (clearanceVal * 3.28084).toFixed(1) + ' ft' : clearanceVal + ' m';

    // Colors
    const isObstructed = linkStats.isObstructed;
    const margin = budget ? budget.margin : 0;
    const isGood = !isObstructed && margin > 10;
    const isWarn = !isObstructed && margin > 0 && margin <= 10;
    
    let statusColor = '#00ff41'; // Green
    let statusText = 'EXCELLENT';
    
    if (isObstructed) {
        statusColor = '#ff0000';
        statusText = 'OBSTRUCTED';
    } else if (margin < 0) {
        statusColor = '#ff0000';
        statusText = 'NO LINK';
    } else if (isWarn) {
        statusColor = '#ffbf00';
        statusText = 'MARGINAL';
    }

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '300px',
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            color: '#eee',
            zIndex: 1000, // Above map
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1em', fontWeight: 600 }}>Link Analysis</h3>
                <span style={{ 
                    fontSize: '0.8em', 
                    fontWeight: 800, 
                    color: '#000', 
                    background: statusColor, 
                    padding: '2px 8px', 
                    borderRadius: '4px' 
                }}>
                    {statusText}
                </span>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9em', marginBottom: '16px' }}>
                <div>
                    <div style={{ color: '#888', fontSize: '0.85em' }}>Distance</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 500 }}>{distDisplay}</div>
                </div>
                <div>
                    <div style={{ color: '#888', fontSize: '0.85em' }}>Margin</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 500, color: statusColor }}>{margin} dB</div>
                </div>
                <div>
                    <div style={{ color: '#888', fontSize: '0.85em' }}>RSSI</div>
                    <div style={{ fontSize: '1.1em' }}>{budget.rssi} dBm</div>
                </div>
                <div>
                    <div style={{ color: '#888', fontSize: '0.85em' }}>First Fresnel</div>
                    <div style={{ fontSize: '1.1em' }}>{clearanceDisplay}</div>
                </div>
            </div>

            {/* Profile Chart */}
            <div style={{ borderTop: '1px solid #333', paddingTop: '12px' }}>
                <div style={{ color: '#888', fontSize: '0.85em', marginBottom: '4px' }}>Terrain & Path Profile</div>
                {linkStats.loading ? (
                    <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontStyle: 'italic' }}>
                        Loading Elevation Data...
                    </div>
                ) : (
                    <LinkProfileChart 
                        profileWithStats={linkStats.profileWithStats} 
                        width={266}
                        height={100}
                        units={units}
                    />
                )}
            </div>

            {/* Legend / Info */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '12px', fontSize: '0.75em', color: '#666' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff41' }}></div>
                    <span>LOS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#444' }}></div>
                    <span>Terrain</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px dashed #00f2ff' }}></div>
                    <span>Fresnel</span>
                </div>
            </div>
        </div>
    );
};

export default LinkAnalysisPanel;
