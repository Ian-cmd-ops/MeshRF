from worker import celery_app
import time
import numpy as np

import os
import redis
import json
from celery.utils.log import get_task_logger
from core.algorithms import calculate_viewshed
from tile_manager import TileManager
from models import NodeConfig
import rf_physics

logger = get_task_logger(__name__)

# Re-init redis/tile_manager here for worker context
# Or use the one from worker.py if we move it there.
# Better to init fresh to avoid fork safety issues with connections.
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")
redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0)
tile_manager = TileManager(redis_client)

@celery_app.task(bind=True)
def calculate_batch_viewshed(self, params):
    """
    Calculate viewsheds for a list of nodes.
    params: { "nodes": [ {lat, lon, height, ...} ], "options": {"radius": 5000, "optimize_n": 3} }
    """
    from core.algorithms import calculate_viewshed
    import base64
    from io import BytesIO
    from PIL import Image

    logger.info(f"Starting batch viewshed for {len(params.get('nodes', []))} nodes")
    self.update_state(state='PROGRESS', meta={'progress': 0, 'message': 'Initializing...'})
    
    nodes_data = params.get('nodes', [])
    options = params.get('options', {})
    radius = float(options.get('radius', 5000))
    optimize_n = options.get('optimize_n')
    rx_height = float(options.get('rx_height', 2.0))
    freq = float(options.get('frequency_mhz', 915.0))
    
    # 1. Determine Bounding Box for Composite
    if not nodes_data:
        return {"status": "completed", "results": []}

    # Helper to convert deg to m approx
    # 1 deg lat = 111,320m
    buffer_deg = (radius + 1000) / 111320.0 
    
    min_lat = min(float(n['lat']) for n in nodes_data) - buffer_deg
    max_lat = max(float(n['lat']) for n in nodes_data) + buffer_deg
    min_lon = min(float(n['lon']) for n in nodes_data) - buffer_deg
    max_lon = max(float(n['lon']) for n in nodes_data) + buffer_deg
    
    # Define Global Master Grid (e.g. 100m resolution)
    res_m = 100
    rows = int((max_lat - min_lat) / (res_m / 111320.0))
    cols = int((max_lon - min_lon) / (res_m / 111320.0))
    
    # Cap size to prevent OOM
    rows = min(rows, 1024)
    cols = min(cols, 1024)
    
    master_grid = np.zeros((rows, cols), dtype=np.uint8)
    
    # Coordinate mapping functions
    def lat_to_y(lat):
        return int((max_lat - lat) / (max_lat - min_lat) * (rows - 1))
    def lon_to_x(lon):
        return int((lon - min_lon) / (max_lon - min_lon) * (cols - 1))

    # Pre-calculate individual viewsheds if we need to optimize
    # Or just calculate all and keep track of visibility
    all_node_results = []
    
    total = len(nodes_data)
    for i, node_data in enumerate(nodes_data):
        try:
            lat = float(node_data.get('lat'))
            lon = float(node_data.get('lon'))
            height = float(node_data.get('height', 10))
            
            # Simple viewshed
            grid, grid_lats, grid_lons = calculate_viewshed(
                tile_manager, lat, lon, height, radius, 
                rx_h=rx_height, freq_mhz=freq, resolution_m=res_m
            )
            
            coverage_count = int(np.sum(grid))
            source_elev = tile_manager.get_elevation(lat, lon)
            
            node_res = {
                "lat": lat, "lon": lon,
                "name": node_data.get('name', f'Site {i + 1}'),
                "height": height,
                "elevation": round(float(source_elev), 1),
                "coverage_area_km2": round((coverage_count * (res_m * res_m)) / 1_000_000.0, 2),
                "grid": grid,
                "grid_lats": grid_lats,
                "grid_lons": grid_lons
            }
            all_node_results.append(node_res)
            
            progress = int((i + 1) / total * 50) # First 50% for individual calcs
            self.update_state(state='PROGRESS', meta={'progress': progress, 'message': f'Analyzed candidates {i+1}/{total}'})
            
        except Exception as e:
            logger.error(f"Error processing node {i}: {e}")

    # 2. Greedy Optimization (Marginal Gain)
    selected_results = all_node_results
    if optimize_n and 0 < optimize_n < len(all_node_results):
        selected_results = []
        covered_points = set() # Set of (y, x) tuples on master_grid
        
        # Pre-compute pixel sets for all candidates
        candidate_sets = []
        for res in all_node_results:
            pixels = set()
            g = res['grid']
            lats = res['grid_lats']
            lons = res['grid_lons']
            
            # Optimization: Vectorized coordinate mapping
            # Get indices where grid > 0
            rows_idx, cols_idx = np.nonzero(g > 0)
            
            if len(rows_idx) > 0:
                # Vectorized lookup of lat/lon
                pixel_lats = lats[rows_idx]
                pixel_lons = lons[cols_idx]
                
                # Vectorized mapping to master grid coordinates
                # y = int((max_lat - lat) / (max_lat - min_lat) * (rows - 1))
                y_vals = ((max_lat - pixel_lats) / (max_lat - min_lat) * (rows - 1)).astype(int)
                
                # x = int((lon - min_lon) / (max_lon - min_lon) * (cols - 1))
                x_vals = ((pixel_lons - min_lon) / (max_lon - min_lon) * (cols - 1)).astype(int)
                
                # Filter valid
                valid_mask = (y_vals >= 0) & (y_vals < rows) & (x_vals >= 0) & (x_vals < cols)
                y_vals = y_vals[valid_mask]
                x_vals = x_vals[valid_mask]
                
                # Convert to set of tuples
                # Creating a set of tuples from 2D array is still somewhat costly but faster than pure Python loop
                if len(y_vals) > 0:
                    coords = np.column_stack((y_vals, x_vals))
                    # Use a set comprehension or map for speed
                    pixels = set(map(tuple, coords))
            
            candidate_sets.append(pixels)

        # Greedy Loop
        remaining_indices = list(range(len(all_node_results)))
        
        for _ in range(optimize_n):
            best_idx = -1
            best_marginal_gain = -1
            
            for idx in remaining_indices:
                cand_pixels = candidate_sets[idx]
                # Calculate new pixels that are NOT in covered_points
                # len(cand_pixels - covered_points)
                # Set difference is fast
                new_coverage = len(cand_pixels.difference(covered_points))
                
                if new_coverage > best_marginal_gain:
                    best_marginal_gain = new_coverage
                    best_idx = idx
            
            if best_idx != -1 and best_marginal_gain > 0:
                selected_results.append(all_node_results[best_idx])
                covered_points.update(candidate_sets[best_idx])
                remaining_indices.remove(best_idx)
            else:
                # No more gain to be had (or empty)
                break

    # 3. Compute marginal coverage for each selected node (in selection order)
    covered_so_far = set()
    for res in selected_results:
        g = res['grid']
        lats_g = res['grid_lats']
        lons_g = res['grid_lons']
        rows_idx, cols_idx = np.nonzero(g > 0)
        node_pixels = set()
        if len(rows_idx) > 0:
            pixel_lats = lats_g[rows_idx]
            pixel_lons = lons_g[cols_idx]
            
            y_vals = ((max_lat - pixel_lats) / (max_lat - min_lat) * (rows - 1)).astype(int)
            x_vals = ((pixel_lons - min_lon) / (max_lon - min_lon) * (cols - 1)).astype(int)
            
            valid_mask = (y_vals >= 0) & (y_vals < rows) & (x_vals >= 0) & (x_vals < cols)
            y_vals = y_vals[valid_mask]
            x_vals = x_vals[valid_mask]
            
            if len(y_vals) > 0:
                coords = np.column_stack((y_vals, x_vals))
                node_pixels = set(map(tuple, coords))
        marginal_pixels = len(node_pixels - covered_so_far)
        covered_so_far.update(node_pixels)
        res['marginal_coverage_km2'] = round((marginal_pixels * (res_m * res_m)) / 1_000_000.0, 2)

    total_unique_km2 = round((len(covered_so_far) * (res_m * res_m)) / 1_000_000.0, 2)
    for res in selected_results:
        total_cov = res['coverage_area_km2']
        res['unique_coverage_pct'] = round(
            (res['marginal_coverage_km2'] / total_cov * 100) if total_cov > 0 else 0.0, 1
        )

    # 3a. Compute pairwise inter-node link quality
    self.update_state(state='PROGRESS', meta={'progress': 55, 'message': 'Analyzing inter-node links...'})
    inter_node_links = []
    n_selected = len(selected_results)
    for i in range(n_selected):
        for j in range(i + 1, n_selected):
            node_a = selected_results[i]
            node_b = selected_results[j]
            try:
                dist_m = rf_physics.haversine_distance(
                    node_a['lat'], node_a['lon'],
                    node_b['lat'], node_b['lon']
                )
                elevs = tile_manager.get_elevation_profile(
                    node_a['lat'], node_a['lon'],
                    node_b['lat'], node_b['lon'],
                    samples=50
                )
                h_a = node_a.get('height', 10.0)
                h_b = node_b.get('height', 10.0)
                link_result = rf_physics.analyze_link(
                    elevs, dist_m, freq, h_a, h_b,
                    k_factor=options.get('k_factor', 1.333),
                    clutter_height=options.get('clutter_height', 0.0)
                )
                path_loss_db = rf_physics.calculate_path_loss(
                    dist_m, elevs, freq, h_a, h_b,
                    model='bullington',
                    k_factor=options.get('k_factor', 1.333),
                    clutter_height=options.get('clutter_height', 0.0)
                )
                inter_node_links.append({
                    "node_a_idx": i,
                    "node_b_idx": j,
                    "node_a_name": node_a.get('name', f'Site {i + 1}'),
                    "node_b_name": node_b.get('name', f'Site {j + 1}'),
                    "dist_km": round(dist_m / 1000, 2),
                    "status": link_result['status'],
                    "path_loss_db": round(float(path_loss_db), 1),
                    "min_clearance_ratio": round(float(link_result['min_clearance_ratio']), 2)
                })
            except Exception as e:
                logger.error(f"Link analysis failed for nodes {i}-{j}: {e}")
                inter_node_links.append({
                    "node_a_idx": i,
                    "node_b_idx": j,
                    "node_a_name": selected_results[i].get('name', f'Site {i + 1}'),
                    "node_b_name": selected_results[j].get('name', f'Site {j + 1}'),
                    "dist_km": 0,
                    "status": "unknown",
                    "path_loss_db": 0,
                    "min_clearance_ratio": 0
                })

    # 4. Blit to Master Grid and generate Composite
    for res in selected_results:
        g = res['grid']
        lats = res['grid_lats']
        lons = res['grid_lons']
        
        # Vectorized Blit
        rows_idx, cols_idx = np.nonzero(g > 0)
        if len(rows_idx) > 0:
            pixel_lats = lats[rows_idx]
            pixel_lons = lons[cols_idx]
            
            y_vals = ((max_lat - pixel_lats) / (max_lat - min_lat) * (rows - 1)).astype(int)
            x_vals = ((pixel_lons - min_lon) / (max_lon - min_lon) * (cols - 1)).astype(int)
            
            valid_mask = (y_vals >= 0) & (y_vals < rows) & (x_vals >= 0) & (x_vals < cols)
            y_vals = y_vals[valid_mask]
            x_vals = x_vals[valid_mask]
            
            if len(y_vals) > 0:
                # Numpy advanced indexing for fast update
                master_grid[y_vals, x_vals] = 255 # Visible
                        
    # 4. Generate PNG Base64 (Neon Cyan RGBA)
    # Create RGBA array
    # rows, cols from master_grid.shape
    height, width = master_grid.shape
    rgba_grid = np.zeros((height, width, 4), dtype=np.uint8)
    
    # Define Neon Cyan: #00f2ff -> (0, 242, 255)
    cyan_r, cyan_g, cyan_b = 0, 242, 255
    opacity = 150 # ~60%
    
    # Mask for visible pixels
    visible_mask = master_grid > 0
    
    # Apply colors where visible
    rgba_grid[visible_mask, 0] = cyan_r
    rgba_grid[visible_mask, 1] = cyan_g
    rgba_grid[visible_mask, 2] = cyan_b
    rgba_grid[visible_mask, 3] = opacity
    
    img = Image.fromarray(rgba_grid, mode='RGBA')
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    # 5. Build Final Output
    final_results = []
    for idx, res in enumerate(selected_results):
        final_results.append({
            "lat": res["lat"],
            "lon": res["lon"],
            "name": res.get("name", f"Site {idx + 1}"),
            "elevation": res["elevation"],
            "coverage_area_km2": res["coverage_area_km2"],
            "marginal_coverage_km2": res.get("marginal_coverage_km2", res["coverage_area_km2"]),
            "unique_coverage_pct": res.get("unique_coverage_pct", 100.0)
        })

    # Compute connectivity score per node (# of viable/degraded links)
    connectivity = [0] * len(final_results)
    for link in inter_node_links:
        if link["status"] in ("viable", "degraded"):
            connectivity[link["node_a_idx"]] += 1
            connectivity[link["node_b_idx"]] += 1
    for idx, res in enumerate(final_results):
        res["connectivity_score"] = connectivity[idx]

    return {
        "status": "completed",
        "results": final_results,
        "inter_node_links": inter_node_links,
        "total_unique_coverage_km2": total_unique_km2,
        "composite": {
            "image": img_str,
            "bounds": {
                "north": max_lat,
                "south": min_lat,
                "east": max_lon,
                "west": min_lon
            }
        }
    }

