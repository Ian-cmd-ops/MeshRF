import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useMapEvents, Marker, Polyline, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { useRF } from '../../context/RFContext';
import { DEVICE_PRESETS } from '../../data/presets';
import { calculateLinkBudget, calculateFresnelRadius, calculateFresnelPolygon, analyzeLinkProfile } from '../../utils/rfMath';
import { fetchElevationPath } from '../../utils/elevation';
import useThrottledCalculation from '../../hooks/useThrottledCalculation';
import * as turf from '@turf/turf';

// Custom Icons (DivIcon for efficiency)

const txIcon = L.divIcon({
    className: 'custom-icon-tx',
    html: `<div style="background-color: #00ff41; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0, 255, 65, 0.8);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const rxIcon = L.divIcon({
    className: 'custom-icon-rx',
    html: `<div style="background-color: #ff0000; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const LinkLayer = ({ nodes, setNodes, linkStats, setLinkStats, setCoverageOverlay, active = true, locked = false }) => {
    const { 
        txPower: proxyTx, antennaGain: proxyGain, // we ignore proxies for calc
        freq, sf, bw, cableLoss, antennaHeight,
        kFactor, clutterHeight, recalcTimestamp,
        editMode, setEditMode, nodeConfigs
    } = useRF();

    // Refs for Manual Update Mode
    const configRef = useRef({ nodeConfigs, freq, kFactor, clutterHeight });

    useEffect(() => {
        configRef.current = { nodeConfigs, freq, kFactor, clutterHeight };
    }, [nodeConfigs, freq, kFactor, clutterHeight]);

    const getIcon = (type, isEditing) => {
        if (type === 'tx') {
            return L.divIcon({
                className: 'custom-icon-tx',
                html: `<div style="background-color: #00ff41; width: ${isEditing ? 24 : 20}px; height: ${isEditing ? 24 : 20}px; border-radius: 50%; border: ${isEditing ? '4px' : '3px'} solid white; box-shadow: 0 0 ${isEditing ? '15px' : '10px'} rgba(0, 255, 65, ${isEditing ? 1 : 0.8}); transition: all 0.2s ease;"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
        }
        return L.divIcon({
            className: 'custom-icon-rx',
            html: `<div style="background-color: #ff0000; width: ${isEditing ? 24 : 20}px; height: ${isEditing ? 24 : 20}px; border-radius: 50%; border: ${isEditing ? '4px' : '3px'} solid white; box-shadow: 0 0 ${isEditing ? '15px' : '10px'} rgba(255, 0, 0, ${isEditing ? 1 : 0.8}); transition: all 0.2s ease;"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    const runAnalysis = useCallback((p1, p2) => {
        if (!p1 || !p2) return;
        
        setLinkStats(prev => ({ ...prev, loading: true }));
        
        // Use LATEST config from ref, not closure
        const currentConfig = configRef.current;
        const h1 = currentConfig.nodeConfigs.A.antennaHeight;
        const h2 = currentConfig.nodeConfigs.B.antennaHeight;
        const currentFreq = currentConfig.freq;

        fetchElevationPath(p1, p2)
            .then(profile => {
                const stats = analyzeLinkProfile(
                    profile, 
                    currentFreq, 
                    h1, h2, 
                    currentConfig.kFactor, 
                    currentConfig.clutterHeight
                );
                setLinkStats(prev => ({ ...prev, ...stats, loading: false }));
            })
            .catch(err => {
                console.error("Link Analysis Failed", err);
                setLinkStats(prev => ({ ...prev, loading: false }));
            });
    }, []); // Empty deps! Stable function.

    useEffect(() => {
        if (nodes.length === 2) {
             runAnalysis(nodes[0], nodes[1]);
        }
    }, [nodes, runAnalysis, recalcTimestamp]);

    useMapEvents({
        click(e) {
            if (!active || locked) return;
            if (nodes.length >= 2) return; 

            const newNode = { 
                lat: e.latlng.lat, 
                lng: e.latlng.lng,
                locked: false
            };

            const newNodes = [...nodes, newNode];
            setNodes(newNodes);

            if (newNodes.length === 1) {
                setEditMode('A'); // Start editing TX
            } else if (newNodes.length === 2) {
                setEditMode('B'); // Then RX
            }
        }
    });

    const handleDrag = (index, e) => {
        const { lat, lng } = e.target.getLatLng();
        setNodes(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], lat, lng };
            return copy;
        });
    };

    const handleDragEnd = (index, e) => {
        const { lat, lng } = e.target.getLatLng();
        setNodes(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], lat, lng };
            // Trigger recalculation
            if (copy.length === 2) {
                runAnalysis(copy[0], copy[1]);
            }
            return copy;
        });
    };

    if (nodes.length < 2) {
        return (
            <>
                {nodes.map((pos, idx) => (
                    <Marker 
                        key={idx} 
                        position={pos} 
                        icon={getIcon(idx === 0 ? 'tx' : 'rx', (idx === 0 && editMode === 'A') || (idx === 1 && editMode === 'B'))}
                        draggable={!pos.locked && active && !locked}
                        eventHandlers={{
                            drag: (e) => handleDrag(idx, e),
                            dragend: (e) => handleDragEnd(idx, e),
                            click: (e) => {
                                L.DomEvent.stopPropagation(e); // Prevent map click from resetting
                                setEditMode(idx === 0 ? 'A' : 'B');
                            }
                        }}
                     >
                         <Popup>
                             <div><strong>{idx === 0 ? "TX (Point A)" : "RX (Point B)"}</strong></div>
                             {(pos.locked || locked) && <div><small>(Locked)</small></div>}
                             <div style={{marginTop: '4px', fontSize: '0.9em', color: '#888'}}>
                                 {((idx === 0 && editMode === 'A') || (idx === 1 && editMode === 'B')) ? "(Editing)" : "Click to Edit"}
                             </div>
                         </Popup>
                    </Marker>
                ))}
            </>
        );
    }

    const [p1, p2] = nodes;
    const distance = turf.distance(
        [p1.lng, p1.lat], 
        [p2.lng, p2.lat], 
        { units: 'kilometers' }
    );

    const fresnelRadius = calculateFresnelRadius(distance, freq);
    
    // Calculate Budget using explicit Node A (TX) -> Node B (RX) logic
    const configA = nodeConfigs.A;
    const configB = nodeConfigs.B;
    
    const budget = calculateLinkBudget({
        txPower: configA.txPower, 
        txGain: configA.antennaGain, 
        txLoss: DEVICE_PRESETS[configA.device]?.loss || 0,
        rxGain: configB.antennaGain, 
        rxLoss: DEVICE_PRESETS[configB.device]?.loss || 0,
        distanceKm: distance, 
        freqMHz: freq,
        sf, bw
    });

    // Determine Color
    let finalColor = '#00ff41'; // Green default
    if (linkStats.isObstructed) {
        finalColor = '#ff0000'; // Obstructed
    } else if (budget.margin < 0) {
        finalColor = '#ff0000'; // No Link Budget
    } else if (budget.margin < 10) {
        finalColor = '#ffbf00'; // Warning
    }

    const fresnelPolygon = calculateFresnelPolygon(p1, p2, freq);

    return (
        <>
            {/* Markers and Lines code... */}
            <Marker 
                position={p1} 
                icon={getIcon('tx', editMode === 'A')}
                draggable={!p1.locked && active && !locked}
                eventHandlers={{
                    drag: (e) => handleDrag(0, e),
                    dragend: (e) => handleDragEnd(0, e),
                    click: (e) => {
                        L.DomEvent.stopPropagation(e);
                        setEditMode('A');
                    }
                }}
            >
                <Popup>
                    <div><strong>TX (Point A)</strong></div>
                    {(p1.locked || locked) && <div><small>(Locked)</small></div>}
                    <div style={{marginTop: '4px', fontSize: '0.9em', color: '#888'}}>
                        {editMode === 'A' ? "(Editing)" : "Click to Edit"}
                    </div>
                </Popup>
            </Marker>
            <Marker 
                position={p2} 
                icon={getIcon('rx', editMode === 'B')}
                draggable={!p2.locked && active && !locked}
                eventHandlers={{
                    drag: (e) => handleDrag(1, e),
                    dragend: (e) => handleDragEnd(1, e),
                    click: (e) => {
                         L.DomEvent.stopPropagation(e);
                         setEditMode('B');
                    }
                }}
            >
                <Popup>
                    <div><strong>RX (Point B)</strong></div>
                    {(p2.locked || locked) && <div><small>(Locked)</small></div>}
                    <div style={{marginTop: '4px', fontSize: '0.9em', color: '#888'}}>
                        {editMode === 'B' ? "(Editing)" : "Click to Edit"}
                    </div>
                </Popup>
            </Marker>

            
            {/* Direct Line of Sight */}
            <Polyline 
                positions={[p1, p2]} 
                pathOptions={{ 
                    color: finalColor, 
                    weight: 3, 
                    dashArray: (budget.margin < 0 || linkStats.isObstructed) ? '10, 10' : null 
                }} 
            />

            {/* Fresnel Zone Visualization (Polygon) */}
            <Polygon 
                positions={fresnelPolygon}
                pathOptions={{ 
                    color: '#00f2ff', 
                    fillOpacity: linkStats.isObstructed ? 0.3 : 0.1, 
                    weight: 1, 
                    dashArray: '5,5',
                    fillColor: linkStats.isObstructed ? '#ff0000' : '#00f2ff'
                }}
            />

        </>
    );
};

export default memo(LinkLayer);
