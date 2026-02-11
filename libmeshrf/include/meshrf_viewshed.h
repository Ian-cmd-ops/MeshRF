#ifndef MESHRF_VIEWSHED_H
#define MESHRF_VIEWSHED_H

#include <vector>
#include <cstdint>

/**
 * Calculates viewshed (binary visibility) for a given elevation grid.
 * 
 * @param elevation_data    Pointer to flat 1D array of elevation values (floats).
 *                          Row-major order: index = y * width + x.
 * @param width             Width of the grid.
 * @param height            Height of the grid.
 * @param tx_x              Transmitter X coordinate (grid index).
 * @param tx_y              Transmitter Y coordinate (grid index).
 * @param tx_h_meters       Transmitter height AGL (meters).
 * @param max_dist_pixels   Maximum visibility distance in pixels.
 *                          (Note: Physical distance depends on GSD, handled by caller/wrapper if needed, 
 *                           but here we iterate pixels).
 * @return                  Pointer to uint8_t buffer (0=invisible, 1=visible).
 *                          Caller owns the memory (std::vector recommended? 
 *                          Prompt asked for uint8_t* buffer return, but std::vector is safer for C++).
 *                          We will return std::vector<uint8_t>.
 */
std::vector<uint8_t> calculate_viewshed(
    const float* elevation_data, 
    int width, 
    int height, 
    int tx_x, 
    int tx_y, 
    float tx_h_meters, 
    int max_dist_pixels,
    float gsd_meters
);

#endif // MESHRF_VIEWSHED_H
