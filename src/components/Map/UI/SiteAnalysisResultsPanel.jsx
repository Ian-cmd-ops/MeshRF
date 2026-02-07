import React, { useState, useEffect } from 'react';

const SiteAnalysisResultsPanel = ({ results, onClose, onCenter, onClear, onRunNew, units }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const panelStyle = {
        position: 'absolute',
        top: isMobile ? 'auto' : '25px',
        bottom: isMobile ? '0' : 'auto',
        right: isMobile ? '0' : '25px',
        left: isMobile ? '0' : 'auto',
        width: isMobile ? '100%' : '360px',
        maxHeight: isMinimized ? '60px' : (isMobile ? '85dvh' : '650px'),
        background: 'rgba(10, 10, 15, 0.98)',
        backdropFilter: 'blur(15px)',
        border: isMobile ? 'none' : '1px solid #00f2ff33',
        borderTop: '1px solid #00f2ff33',
        borderRadius: isMobile ? '20px 20px 0 0' : '12px',
        padding: '16px',
        paddingBottom: isMobile ? 'calc(32px + env(safe-area-inset-bottom))' : '16px',
        color: '#eee',
        zIndex: 2500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
    };

    return (
        <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '16px',
                    cursor: 'pointer'
                }}
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.2em', fontWeight: 600, color: '#00f2ff' }}>
                        Site Analysis Results
                    </h3>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>{results.length} Locations Processed</div>
                </div>
                <div style={{ color: '#00f2ff', fontSize: '1.2rem' }}>
                    {isMinimized ? '▲' : '▼'}
                </div>
            </div>

            {/* Content Area */}
            {!isMinimized && (
                <>
                    <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '4px' }}>
                        {results.map((res, index) => (
                            <div 
                                key={index}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => onCenter(res)}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = 'rgba(0, 242, 255, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(0, 242, 255, 0.2)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 'bold', color: '#fff' }}>Site {index + 1}</span>
                                    <span style={{ color: '#00f2ff', fontSize: '0.8em', fontFamily: 'monospace' }}>
                                        {res.lat.toFixed(4)}, {res.lon.toFixed(4)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7em', color: '#888', textTransform: 'uppercase' }}>Elevation</div>
                                        <div style={{ color: '#00f2ff', fontWeight: 'bold', fontSize: '1.1em' }}>
                                            {units === 'imperial' 
                                                ? `${(res.elevation * 3.28084).toFixed(1)} ft` 
                                                : `${res.elevation} m`}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7em', color: '#888', textTransform: 'uppercase' }}>Coverage Area</div>
                                        <div style={{ color: '#00f2ff', fontWeight: 'bold', fontSize: '1.1em' }}>
                                            {units === 'imperial' 
                                                ? `${(res.coverage_area_km2 * 0.386102).toFixed(2)} mi²` 
                                                : `${res.coverage_area_km2} km²`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                            onClick={onRunNew}
                            style={{
                                padding: '10px',
                                background: 'rgba(0, 242, 255, 0.15)',
                                color: '#00f2ff',
                                border: '1px solid rgba(0, 242, 255, 0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.target.style.background = 'rgba(0, 242, 255, 0.25)'}
                            onMouseOut={e => e.target.style.background = 'rgba(0, 242, 255, 0.15)'}
                        >
                            Run New Analysis
                        </button>
                        <button 
                            onClick={onClear}
                            style={{
                                padding: '10px',
                                background: 'rgba(255, 50, 50, 0.1)',
                                color: '#ff4444',
                                border: '1px solid rgba(255, 50, 50, 0.2)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9em'
                            }}
                            onMouseOver={e => e.target.style.background = 'rgba(255, 50, 50, 0.2)'}
                            onMouseOut={e => e.target.style.background = 'rgba(255, 50, 50, 0.1)'}
                        >
                            Clear Results
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SiteAnalysisResultsPanel;
