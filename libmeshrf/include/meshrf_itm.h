#ifndef MESHRF_ITM_H
#define MESHRF_ITM_H

#include <vector>
#include <vector>

struct LinkParameters {
    double frequency_mhz;
    double tx_height_m;
    double rx_height_m;
    int polarization; // 0=horiz, 1=vert
    double step_size_m; // Added: Required to calculate distance from profile index
    
    // ITM Defaults for Environment
    double N_0 = 301.0;
    double epsilon = 15.0;
    double sigma = 0.005;
    int climate = 5; // Continental Temperate
};

/**
 * Calculates Path Loss (dB) for every point along the radial profile.
 * 
 * @param terrain_profile   Pointer to array of elevation values (floats)
 * @param profile_length    Number of points in the profile
 * @param params            Link parameters (freq, heights, etc.)
 * @return                  Vector of path loss values (dB) matching the profile length.
 *                          Index 0 (TX) will be 0.0.
 */
std::vector<float> calculate_radial_loss(float* terrain_profile, int profile_length, LinkParameters params);

#endif // MESHRF_ITM_H
