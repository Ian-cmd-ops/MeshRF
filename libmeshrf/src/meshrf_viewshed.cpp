#include "meshrf_viewshed.h"
#include <cmath>
#include <algorithm>
#include <vector>

// Constants for Earth Curvature
// Radius ~ 6371 km. 
// Refraction k = 1.33
// R_eff = 6371 * 1.33 * 1000 meters = 8473430 meters
const float R_EFF_METERS = 8473430.0f;
const float PI = 3.14159265359f;

// Helper to get elevation with bounds check (though rays should be bounded)
inline float get_elev(const float* data, int w, int h, int x, int y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return 0.0f; // Limit or NAN?
    return data[y * w + x];
}

void cast_ray(
    const float* elevation_data,
    std::vector<uint8_t>& visibility,
    int width,
    int height,
    int x0, int y0, // TX
    int x1, int y1, // Target
    float tx_elev_amsl,
    float meter_per_pixel
) {
    const float GSD = meter_per_pixel; 

    int dx = abs(x1 - x0);
    int dy = abs(y1 - y0);
    int sx = (x0 < x1) ? 1 : -1;
    int sy = (y0 < y1) ? 1 : -1;
    int err = dx - dy;

    int x = x0;
    int y = y0;

    float max_slope = -9999.0f; // Starting slope (looking down/up)
    
    // TX is always visible
    visibility[y0 * width + x0] = 1;

    while (true) {
        if (x == x1 && y == y1) break;

        int e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }

        if (x < 0 || x >= width || y < 0 || y >= height) break;

        // Calculate Distance
        // Euclidean distance in pixels
        float d_pixels = std::sqrt(std::pow(x - x0, 2) + std::pow(y - y0, 2));
        float d_meters = d_pixels * GSD;
        
        if (d_meters < 1.0f) continue; // Skip too close (or handle TX point)

        // Earth Curvature Drop (Curved Earth adjustment)
        // z_effective = z_actual - (d^2 / (2 * R_eff))
        // Actually, normally we adjust the Viewing Angle.
        // Slope = (Target_Z_eff - TX_Z_eff) / Dist
        // TX_Z_eff = TX_AMSL (since d=0)
        // Target_Z_eff = Target_Elev - (d^2 / 2R)
        
        float terrain_z = elevation_data[y * width + x];
        float curvature_drop = (d_meters * d_meters) / (2.0f * R_EFF_METERS);
        float z_eff = terrain_z - curvature_drop;
        
        float slope = (z_eff - tx_elev_amsl) / d_meters;

        if (slope > max_slope) {
            // Visible
            max_slope = slope;
            visibility[y * width + x] = 1;
        } else {
            // Obstructed
            // Do not update max_slope
             // visible set to 0 by default
        }
    }
}

std::vector<uint8_t> calculate_viewshed(
    const float* elevation_data, 
    int width, 
    int height, 
    int tx_x, 
    int tx_y, 
    float tx_h_meters, 
    int max_dist_pixels,
    float gsd_meters
) {
    // 1. Allocate Result Buffer (Init 0)
    std::vector<uint8_t> visibility(width * height, 0);

    // 2. Validate Inputs
    if (tx_x < 0 || tx_x >= width || tx_y < 0 || tx_y >= height) {
        return visibility;
    }

    float tx_ground_elev = elevation_data[tx_y * width + tx_x];
    float tx_elev_amsl = tx_ground_elev + tx_h_meters;

    // 3. Iterate Perimeter of Bounding Box
    // Box: [tx_x - R, tx_x + R] x [tx_y - R, tx_y + R]
    int x_min = std::max(0, tx_x - max_dist_pixels);
    int x_max = std::min(width - 1, tx_x + max_dist_pixels);
    int y_min = std::max(0, tx_y - max_dist_pixels);
    int y_max = std::min(height - 1, tx_y + max_dist_pixels);

    // 3. Angular Ray Casting (Sweep)
    // Instead of iterating perimeter pixels, we sweep by angle.
    // Step size determined by arc length < 1 pixel at max distance.
    // Arc Length = Radius * theta. We want Arc Length ~ 0.5 to 1.0.
    // theta = 1.0 / Radius.
    
    // Safety: prevent div by zero
    if (max_dist_pixels < 1) return visibility;

    float angular_step = 1.0f / (float)max_dist_pixels; 
    
    // Iterate 360 degrees
    for (float angle = 0.0f; angle < 2.0f * PI; angle += angular_step) {
        int x1 = tx_x + (int)(std::cos(angle) * max_dist_pixels);
        int y1 = tx_y + (int)(std::sin(angle) * max_dist_pixels);

        cast_ray(elevation_data, visibility, width, height, tx_x, tx_y, x1, y1, tx_elev_amsl, gsd_meters);
    }
    
    // Note: The angular sweep ensures dense coverage without moire/aliasing holes at distance.
    
    return visibility;
}
