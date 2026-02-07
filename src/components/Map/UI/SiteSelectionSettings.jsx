
import React from 'react';
import { useRF } from '../../../context/RFContext';

const SiteSelectionSettings = ({ weights, setWeights, active }) => {
    const { isMobile } = useRF();
    
    if (!active) return null;

    const handleChange = (key, val) => {
        setWeights(prev => ({ ...prev, [key]: parseFloat(val) }));
    };

    const containerStyle = {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        userSelect: 'none'
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                borderBottom: '1px solid rgba(0, 242, 255, 0.15)',
                paddingBottom: '8px',
                marginBottom: '4px'
            }}>
                <div style={{ 
                    width: 6, height: 6, 
                    borderRadius: '50%', 
                    backgroundColor: '#00f2ff', 
                    boxShadow: '0 0 8px #00f2ff' 
                }}></div>
                <span style={{
                    color: '#00f2ff', 
                    fontWeight: '800', 
                    fontSize: '0.8em', 
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}>
                    Optimization Weights
                </span>
                <div style={{ 
                    width: 6, height: 6, 
                    borderRadius: '50%', 
                    backgroundColor: '#00f2ff', 
                    boxShadow: '0 0 8px #00f2ff' 
                }}></div>
            </div>
            
            {/* Control Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '16px' 
            }}>
                {Object.keys(weights).map(key => (
                    <div key={key} style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                             <label style={{
                                color: '#888', 
                                fontSize: '0.65em', 
                                textTransform: 'uppercase', 
                                fontWeight: 'bold'
                            }}>
                                {key}
                            </label>
                            <span style={{
                                color: '#00f2ff', 
                                fontSize: '0.8em', 
                                fontWeight: '900', 
                                fontFamily: 'monospace'
                            }}>
                                {weights[key].toFixed(1)}
                            </span>
                        </div>
                        
                        <input 
                            type="range" 
                            min="0" max="1" step="0.1" 
                            value={weights[key]} 
                            onChange={(e) => handleChange(key, e.target.value)}
                            style={{ 
                                width: '100%', 
                                accentColor: '#00f2ff',
                                margin: '0',
                                cursor: 'pointer',
                                height: '20px'
                            }}
                        />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slideDown {
                    from { transform: translate(-50%, -20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                
                /* Custom Range Styling for Native feel */
                input[type=range] {
                    -webkit-appearance: none;
                    background: transparent;
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #00f2ff;
                    cursor: pointer;
                    margin-top: -6px;
                    box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
                    border: 2px solid #fff;
                }
            `}</style>
        </div>
    );
};

export default SiteSelectionSettings;
