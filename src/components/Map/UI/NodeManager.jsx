import React, { useState, useEffect } from 'react';
import useSimulationStore from '../../../store/useSimulationStore';

const NodeManager = ({ selectedLocation }) => {
    const { nodes, addNode, removeNode, startScan, isScanning, scanProgress, results, compositeOverlay } = useSimulationStore();
    const [manualLat, setManualLat] = useState('');
    const [manualLon, setManualLon] = useState('');
    const [isGreedy, setIsGreedy] = useState(false);
    const [targetCount, setTargetCount] = useState(3);

    useEffect(() => {
        if (selectedLocation) {
            setManualLat(selectedLocation.lat.toFixed(6));
            setManualLon(selectedLocation.lng.toFixed(6));
        }
    }, [selectedLocation]);

    const handleAdd = () => {
        if (!manualLat || !manualLon) return;
        addNode({ 
            lat: parseFloat(manualLat), 
            lon: parseFloat(manualLon), 
            height: 10,
            name: `Node ${nodes.length + 1}`
        });
        setManualLat('');
        setManualLon('');
    };

    const handleRunScan = () => {
        startScan(isGreedy ? targetCount : null);
    };

    const styles = {
        container: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, sans-serif'
        },
        header: {
            fontWeight: 'bold',
            fontSize: '1em',
            marginBottom: '12px',
            color: '#00f2ff', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: '1px solid #00f2ff33',
            paddingBottom: '8px',
            flexShrink: 0
        },
        inputGroup: {
            display: 'flex',
            gap: '8px',
            marginBottom: '16px'
        },
        input: {
            width: '33%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid #333',
            borderRadius: '4px',
            padding: '6px 8px',
            fontSize: '0.875rem',
            color: '#fff',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'monospace'
        },
        addButton: {
            backgroundColor: 'rgba(0, 242, 255, 0.1)',
            color: '#00f2ff',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            border: '1px solid #00f2ff66',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.2s'
        },
        nodeList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '16px',
            maxHeight: '180px',
            overflowY: 'auto'
        },
        nodeItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #333'
        },
        removeBtn: {
            color: '#ff4444', 
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '0 8px',
            opacity: 0.8,
            transition: 'opacity 0.2s'
        },
        actionButton: {
            width: '100%',
            padding: '10px 0',
            borderRadius: '4px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '1px'
        },
        scanBarContainer: {
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '2px',
            height: '6px',
            marginTop: '8px',
            overflow: 'hidden'
        },
        scanBarFill: {
            height: '100%',
            backgroundColor: '#00f2ff',
            boxShadow: '0 0 10px #00f2ff',
            transition: 'width 0.3s ease'
        },
        optContainer: {
            background: 'rgba(0, 242, 255, 0.03)',
            border: '1px solid rgba(0, 242, 255, 0.15)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>Multi-Site Analysis</div>
            
            {/* Input Form */}
            <div style={styles.inputGroup}>
                <input 
                    type="number" 
                    placeholder="Lat" 
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    style={styles.input}
                />
                <input 
                    type="number" 
                    placeholder="Lon" 
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    style={styles.input}
                />
                <button 
                    onClick={handleAdd}
                    style={styles.addButton}
                >
                    Add
                </button>
            </div>

            {/* Node List */}
            <div style={styles.nodeList}>
                {nodes.length === 0 && (
                    <div style={{textAlign: 'center', color: '#555', padding: '16px', border: '1px dashed #333', borderRadius: '4px', fontSize: '0.85em'}}>
                        No candidate points added
                    </div>
                )}
                
                {nodes.map((node) => (
                    <div key={node.id} style={styles.nodeItem}>
                        <div>
                            <div style={{fontWeight: '600', fontSize: '0.8rem', color: '#fff'}}>{node.name}</div>
                            <div style={{fontSize: '0.7rem', color: '#00f2ff', fontFamily: 'monospace'}}>{node.lat.toFixed(4)}, {node.lon.toFixed(4)}</div>
                        </div>
                        <button onClick={() => removeNode(node.id)} style={styles.removeBtn}>×</button>
                    </div>
                ))}
            </div>

            {/* Optimization Config */}
            <div style={styles.optContainer}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{color: '#00f2ff', fontSize: '0.75em', fontWeight: 'bold', textTransform: 'uppercase'}}>Greedy Optimization</span>
                    <input 
                        type="checkbox" 
                        checked={isGreedy} 
                        onChange={(e) => setIsGreedy(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        style={{accentColor: '#00f2ff', cursor: 'pointer'}}
                    />
                </div>
                
                {isGreedy && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.7em', color: '#888'}}>
                            <span>Target Node Count</span>
                            <span style={{color: '#00f2ff', fontWeight: 'bold'}}>{targetCount}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" max={Math.max(1, nodes.length)} step="1"
                            value={targetCount}
                            onChange={(e) => setTargetCount(parseInt(e.target.value))}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            style={{width: '100%', accentColor: '#00f2ff'}}
                        />
                    </div>
                )}
            </div>

            {/* Status & Actions */}
            {isScanning ? (
                <div>
                    <div style={{fontSize: '0.8rem', color: '#00f2ff', fontFamily: 'monospace', marginBottom: '6px', display: 'flex', justifyContent: 'space-between'}}>
                        <span>SCANNING...</span>
                        <span>{Math.round(scanProgress)}%</span>
                    </div>
                    <div style={styles.scanBarContainer}>
                        <div style={{...styles.scanBarFill, width: `${scanProgress}%`}}></div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={handleRunScan}
                    disabled={nodes.length < (isGreedy ? 1 : 2)}
                    style={{
                        ...styles.actionButton,
                        backgroundColor: (nodes.length < (isGreedy ? 1 : 2)) ? 'rgba(255,255,255,0.05)' : 'rgba(0, 242, 255, 0.15)',
                        border: (nodes.length < (isGreedy ? 1 : 2)) ? '1px solid #333' : '1px solid #00f2ff',
                        color: (nodes.length < (isGreedy ? 1 : 2)) ? '#555' : '#00f2ff',
                        cursor: (nodes.length < (isGreedy ? 1 : 2)) ? 'not-allowed' : 'pointer',
                        boxShadow: (nodes.length < (isGreedy ? 1 : 2)) ? 'none' : '0 0 15px rgba(0, 242, 255, 0.2)'
                    }}
                >
                    Run Site Analysis
                </button>
            )}
        </div>
    );
};

export default NodeManager;
