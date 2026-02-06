
import React from 'react';

const SiteSelectionSettings = ({ weights, setWeights, active }) => {
    if (!active) return null;

    const handleChange = (key, val) => {
        setWeights(prev => ({ ...prev, [key]: parseFloat(val) }));
    };

    return (
        <div style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '1px solid #00f2ff33',
            borderRadius: '12px',
            padding: '12px 20px',
            zIndex: 1000,
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{color: '#00f2ff', fontWeight: 'bold', fontSize: '0.9em', textTransform: 'uppercase'}}>Criteria Weights</div>
            
            {Object.keys(weights).map(key => (
                <div key={key} style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <label style={{color: '#aaa', fontSize: '0.75em', textTransform: 'capitalize'}}>{key}</label>
                    <input 
                        type="range" 
                        min="0" max="1" step="0.1" 
                        value={weights[key]} 
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{width: '80px', accentColor: '#00f2ff'}}
                    />
                    <div style={{color: '#fff', fontSize: '0.7em', textAlign: 'right'}}>{weights[key]}</div>
                </div>
            ))}
        </div>
    );
};

export default SiteSelectionSettings;
