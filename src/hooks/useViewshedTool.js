import { useState, useCallback, useEffect, useRef } from 'react';
import { stitchElevationGrids, transformObserverCoords, calculateStitchedBounds } from '../utils/tileStitcher';


// Initialize Worker
// Vite handles 'new Worker' with URL import
const worker = new Worker(new URL('../../libmeshrf/js/Worker.ts', import.meta.url), { type: 'module' });

// Global status tracking to handle multiple hook instances and re-mounts
let globalWorkerReady = false;
const statusListeners = new Set();

worker.onmessage = (e) => {
    const { type } = e.data;
    if (type === 'INIT_COMPLETE') {
        globalWorkerReady = true;
        statusListeners.forEach(listener => listener(true));
        statusListeners.clear();
    }
};

// Initial query in case it's already running
worker.postMessage({ type: 'QUERY_INIT_STATUS' });

export function useViewshedTool(active) {
    const [resultLayer, setResultLayer] = useState(null); // { data, width, height, bounds }
    const [isCalculating, setIsCalculating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [_ready, setReady] = useState(globalWorkerReady);

    
    // Track analysis state
    const analysisIdRef = useRef(null);

    useEffect(() => {
        if (globalWorkerReady) {
            setReady(true);
            return;
        }

        const handleStatus = (isReady) => setReady(isReady);
        statusListeners.add(handleStatus);

        // Ping the worker again if it's inactive but the hook just mounted
        worker.postMessage({ type: 'QUERY_INIT_STATUS' });

        return () => statusListeners.delete(handleStatus);
    }, []);

    useEffect(() => {
        // We still need a local message handler for individual tool results
        const handleMessage = (e) => {
            const { type, id, result, error: workerError } = e.data;
            
            if (workerError) {
                console.error("Worker Error:", workerError);
                if (analysisIdRef.current && id === analysisIdRef.current) {
                    setIsCalculating(false);
                    setError(workerError);
                }
                return;
            }

            if (type === 'CALCULATE_VIEWSHED_RESULT') {
                if (analysisIdRef.current && id === analysisIdRef.current) {

                   
                   // result is Uint8Array of the stitched grid
                   // DEBUG: Check visibility
                   let visibleCount = 0;
                   for(let k=0; k<result.length; k++) { if(result[k] > 0) visibleCount++; }

                   
                    if (currentBoundsRef.current) {
                       setResultLayer({
                           data: result,
                           width: currentBoundsRef.current.width,
                           height: currentBoundsRef.current.height,
                           bounds: currentBoundsRef.current.bounds,
                           // Pass metadata for shader (Bug 2 fix)
                           observerCoords: currentBoundsRef.current.observerCoords,
                           gsd: currentBoundsRef.current.gsd,
                           radiusPixels: currentBoundsRef.current.radiusPixels
                       });
                   }
                   setIsCalculating(false);
                }
            }
        };

        worker.addEventListener('message', handleMessage);
        return () => worker.removeEventListener('message', handleMessage);
    }, []);


    // Clear state when tool is deactivated
    useEffect(() => {
        if (!active) {
            setResultLayer(null);
            setError(null);
        }
    }, [active]);
    
    const currentBoundsRef = useRef(null);
    
    // Helper: Lat/Lon to Tile Coordinates
    const getTile = (lat, lon, zoom) => {
        const d2r = Math.PI / 180;
        const n = Math.pow(2, zoom);
        const x = Math.floor(n * ((lon + 180) / 360));
        const y = Math.floor(n * (1 - Math.log(Math.tan(lat * d2r) + 1 / Math.cos(lat * d2r)) / Math.PI) / 2);
        return { x, y, z: zoom };
    };

    // Helper: Tile bounds
    const _getTileBounds = (x, y, z) => {
        const tile2long = (x, z) => (x / Math.pow(2, z)) * 360 - 180;
        const tile2lat = (y, z) => {
            const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
            return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
        };
        return {
            west: tile2long(x, z),
            north: tile2lat(y, z),
            east: tile2long(x + 1, z),
            south: tile2lat(y + 1, z)
        };
    };
    
    // Helper: Get Tiles covering a radius
    const getNecessaryTiles = (centerTile, lat, radiusMeters) => {
      // Calculate tile width in meters at this latitude/zoom
      // Earth circum = 40075017 m
      const earthCircum = 40075017;
      const latRad = lat * Math.PI / 180;
      const tileWidthMeters = (Math.cos(latRad) * earthCircum) / Math.pow(2, centerTile.z);
      
      // Radius in tiles (ceil to ensure coverage)
      // Add 1 tile buffer for safety
      const radiusTiles = Math.ceil(radiusMeters / tileWidthMeters) + 1;
      
      const tiles = [];
      const maxTile = Math.pow(2, centerTile.z) - 1;

      for (let dx = -radiusTiles; dx <= radiusTiles; dx++) {
          for (let dy = -radiusTiles; dy <= radiusTiles; dy++) {
              const x = centerTile.x + dx;
              const y = centerTile.y + dy;
              
              if (y < 0 || y > maxTile) continue; // Skip vertical out of bounds
              
              let wrappedX = x;
              if (x < 0) wrappedX = maxTile + x + 1;
              if (x > maxTile) wrappedX = x - maxTile - 1;
              
              tiles.push({ x: wrappedX, y, z: centerTile.z });
          }
      }
      return { tiles, radiusTiles };
    };

    const fetchAndDecodeTile = async (tile) => {
        const tileUrl = `/api/tiles/${tile.z}/${tile.x}/${tile.y}.png`;
        try {
            const img = document.createElement('img');
            img.crossOrigin = "Anonymous";
            img.src = tileUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const pixels = imageData.data;
            const floatData = new Float32Array(img.width * img.height);
            
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                floatData[i / 4] = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
            }
            
            return {
                elevation: floatData,
                width: img.width,
                height: img.height,
                tile
            };
        } catch (err) {
            console.warn(`Failed to fetch tile ${tile.x}/${tile.y}`, err);
            return null; // Return null on failure
        }
    };

    const runAnalysis = useCallback(async (latOrObserver, lonOrMaxDist, height = 2.0, maxDist = 25000) => {
        // Handle both calling patterns:
        // 1. runAnalysis({lat, lng}, maxDist) - object pattern
        // 2. runAnalysis(lat, lng, height, maxDist) - individual pattern
        let lat, lon, actualMaxDist;
        
        if (typeof latOrObserver === 'object' && latOrObserver.lat !== undefined) {
            // Object pattern: first arg is {lat, lng}, second is maxDist
            lat = latOrObserver.lat;
            lon = latOrObserver.lng;
            // FIX BUG 3: Extract height if present, otherwise keep default
            if (latOrObserver.height !== undefined) {
                height = latOrObserver.height;
            }
            actualMaxDist = lonOrMaxDist || maxDist;
        } else {
            // Individual pattern: (lat, lon, height, maxDist)
            lat = latOrObserver;
            lon = lonOrMaxDist;
            actualMaxDist = maxDist;
        }
        
        // Wait for worker to initialize if needed
        if (!globalWorkerReady) {
            let attempts = 0;
            while (!globalWorkerReady && attempts < 20) {
                await new Promise(r => setTimeout(r, 200));
                attempts++;
            }
            if (!globalWorkerReady) {
                console.error("Worker failed to initialize in time");
                setError("Engine failed to start. Please reload.");
                return;
            }
        }

        
        setIsCalculating(true);
        setError(null);
        setResultLayer(null);
        
        const currentAnalysisId = `vs-stitch-${Date.now()}`;
        analysisIdRef.current = currentAnalysisId;
        
        try {
            // Safety: Check if Context Lost (if using WebGL in future, but good practice)
            // Safety: Check if buffer is already detached
            
            const zoom = actualMaxDist > 8000 ? 10 : 12; 
            const centerTile = getTile(lat, lon, zoom);

            // Calculate GSD (Ground Sampling Distance) for the analysis
            const latRad = lat * Math.PI / 180;
            const gsd_meters = (2 * Math.PI * 6378137 * Math.cos(latRad)) / (256 * Math.pow(2, zoom));
            
            
            // 1. Get Tiles
            const { tiles: targetTiles, radiusTiles: tileRadius } = getNecessaryTiles(centerTile, lat, actualMaxDist);
            
            // 2. Fetch all in parallel with progress
            let completed = 0;
            const total = targetTiles.length;
            setProgress(10); // Start
            
            const loadedTiles = await Promise.all(targetTiles.map(async (tile) => {
                const result = await fetchAndDecodeTile(tile);
                completed++;
                setProgress(10 + Math.floor((completed / total) * 80)); // 10% -> 90%
                return result;
            }));
            
            const validTiles = loadedTiles.filter(t => t !== null);
            
            if (validTiles.length === 0) {
                setError("Failed to load any elevation data");
                setIsCalculating(false);
                return;
            }
            
            setProgress(95); // Stitching...
            
            // 3. Stitch Tiles (Dynamic Pivot)
            const stitched = stitchElevationGrids(validTiles, centerTile, 256, tileRadius);

            
            // 4. Calculate Observer Position in Stitched Grid
            const observerCoords = transformObserverCoords(lat, lon, centerTile, stitched.width, stitched.height, 256, tileRadius);
            
            // 5. Calculate Stitched Geographic Bounds
            const bounds = calculateStitchedBounds(centerTile, tileRadius);
            
            const maxDistPixels = Math.floor(actualMaxDist / gsd_meters); // FIX BUG 2: Calculate generic

            // Store context for callback
            // eslint-disable-next-line react-hooks/exhaustive-deps
            currentBoundsRef.current = {
                width: stitched.width,
                height: stitched.height,
                bounds: bounds,
                 // Store context for resultLayer (Bug 2 fix)
                observerCoords: observerCoords,
                gsd: gsd_meters,
                radiusPixels: maxDistPixels
            };
            
            // 6. Safety Check before Transfer
            if (stitched.data.byteLength === 0) {
                throw new Error("Stitched elevation buffer is empty or already detached");
            }

            // 7. Dispatch Single Job to Worker
            worker.postMessage({
                id: currentAnalysisId,
                type: 'CALCULATE_VIEWSHED',
                payload: {
                    elevation: stitched.data, // Single 768x768 grid
                    width: stitched.width,
                    height: stitched.height,
                    tx_x: observerCoords.x,
                    tx_y: observerCoords.y,
                    tx_h: height,
                    max_dist: maxDistPixels, // FIX BUG 1: Use actualMaxDist (via pre-calc variable)
                    gsd_meters: gsd_meters
                }
            }, [stitched.data.buffer]); 

        } catch (err) {
            console.error("Analysis Failed:", err);
            setError(err.message);
            setIsCalculating(false);
        }

    }, []);

    const clear = useCallback(() => {
        setResultLayer(null);
        setError(null);
    }, []);

    return { runAnalysis, resultLayer, isCalculating, progress, error, clear };
}
