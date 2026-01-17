#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <cstdint>
#include "meshrf_itm.h"
#include "meshrf_viewshed.h"
#include <vector>

using namespace emscripten;

// Helper to bind LinkParameters struct
// External declaration
std::vector<int> optimize_site_selection(const float* coverage_matrix, int num_candidates, int num_targets);

EMSCRIPTEN_BINDINGS(meshrf_module) {
    
    // Bind LinkParameters Struct
    value_object<LinkParameters>("LinkParameters")
        .field("frequency_mhz", &LinkParameters::frequency_mhz)
        .field("tx_height_m", &LinkParameters::tx_height_m)
        .field("rx_height_m", &LinkParameters::rx_height_m)
        .field("polarization", &LinkParameters::polarization)
        .field("step_size_m", &LinkParameters::step_size_m)
        .field("N_0", &LinkParameters::N_0)
        .field("epsilon", &LinkParameters::epsilon)
        .field("sigma", &LinkParameters::sigma)
        .field("climate", &LinkParameters::climate)
        ;

    // Register Vector types
    register_vector<float>("VectorFloat");
    register_vector<uint8_t>("VectorUint8");
    register_vector<int>("VectorInt"); // Added for optimization result
    
    // 1. Calculations: Radial Loss (ITM)
    // We need to handle the raw pointer passing slightly differently for JS.
    // JS side will pass a typed array. Embind supports 'memory view' or manual pointer arithmetic.
    // Prompt Set 3 specifically asks to: 
    // "Calculate byte size... Call Module._malloc()... Call Module.HEAPF32.set()..."
    // So we should expose a C-style function that takes a uintptr_t (memory address) ?
    // Embind allows direct binding of functions. If we bind `calculate_radial_loss`, 
    // Embind tries to marshall types.
    // Spec says: "Call the C++ function calculate_viewshed()."
    // Since we are doing manual memory management per Prompt 3, we likely want to expose a function 
    // that takes an integer address (pointer) and size.
    
    // Standalone functions for manual memory management
    function("calculate_itm", optional_override([](uintptr_t profile_ptr, int count, LinkParameters params) {
        float* profile = reinterpret_cast<float*>(profile_ptr);
        return calculate_radial_loss(profile, count, params);
    }));

    function("calculate_viewshed", optional_override([](uintptr_t elev_ptr, int width, int height, int tx_x, int tx_y, float tx_h, int max_dist) {
        float* elev = reinterpret_cast<float*>(elev_ptr);
        return calculate_viewshed(elev, width, height, tx_x, tx_y, tx_h, max_dist);
    }));
        
    // Wait, Prompt Set 2/3 implies we might just export standalone functions.
    // "Call the C++ function calculate_viewshed()."
    // Embind:

}
