#include <iostream>
#include <vector>
#include <iomanip>
#include "meshrf_itm.h"
#include "meshrf_viewshed.h"

int main() {
    std::cout << "Starting MeshRF Native Test..." << std::endl;

    // --- Test 1: Viewshed ---
    {
        std::cout << "[Test] Viewshed Algorithm" << std::endl;
        int w = 100;
        int h = 100;
        std::vector<float> elevation(w * h, 100.0f); // Flat plane 100m
        
        // Add a "Mountain" blocking view
        // Center (50, 50). Mountain at (60, 50).
        elevation[50 * w + 60] = 500.0f; 

        int tx_x = 50;
        int tx_y = 50;
        float tx_h = 10.0f;
        int max_dist = 40;

        auto visibility = calculate_viewshed(elevation.data(), w, h, tx_x, tx_y, tx_h, max_dist);

        // Check visibility
        int visible_count = 0;
        for (uint8_t v : visibility) {
            if (v) visible_count++;
        }
        std::cout << "  Visible Pixels: " << visible_count << std::endl;
        
        // Detailed check: (65, 50) should be blocked by (60, 50)
        int idx_blocked = 50 * w + 65;
        std::cout << "  Pixel behind mountain (65,50) visibility: " << (int)visibility[idx_blocked] << std::endl;
    }

    // --- Test 2: ITM Radial Loss ---
    {
        std::cout << "\n[Test] ITM Radial Loss" << std::endl;
        
        int profile_len = 100;
        std::vector<float> profile(profile_len, 100.0f); // 100m elev flat
        
        LinkParameters params;
        params.frequency_mhz = 900.0;
        params.tx_height_m = 10.0;
        params.rx_height_m = 2.0;
        params.polarization = 1; // Vert
        params.step_size_m = 30.0; // 30m steps

        auto losses = calculate_radial_loss(profile.data(), profile_len, params);

        std::cout << "  Calculated " << losses.size() << " loss points." << std::endl;
        std::cout << "  Loss at 10 steps (300m): " << losses[10] << " dB" << std::endl;
        std::cout << "  Loss at 99 steps (~3km): " << losses[99] << " dB" << std::endl;
    }
    
    std::cout << "Test Complete." << std::endl;
    return 0;
}
