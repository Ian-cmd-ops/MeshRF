#include <vector>
#include <algorithm>
#include <iostream>
#include <cmath>
#include <cstdint>

/**
 * Greedy Set Cover Algorithm for Network Optimization
 * 
 * Goal: Select a subset of 'candidates' that cover the maximum number of 'targets'.
 * 
 * Inputs:
 * - coverage_matrix: Flat array of size (num_candidates * num_targets).
 *   Row-major: index = candidate_idx * num_targets + target_idx.
 *   Value: 1.0 (covered) or 0.0 (not covered).
 * - num_candidates: Number of potential sites.
 * - num_targets: Number of points to cover.
 * 
 * Returns:
 * - std::vector<int>: Indices of the selected candidates.
 */
std::vector<int> optimize_site_selection(
    const float* coverage_matrix, 
    int num_candidates, 
    int num_targets
) {
    std::vector<int> selected_sites;
    std::vector<bool> is_target_covered(num_targets, false);
    
    // Track remaining targets to avoid full scan if complete
    int covered_count = 0;
    
    // Naive Greedy Approach: 
    // Just loop K times or until all covered. 
    // In real implementation, we might have a budget "k". 
    // For now, let's select until no gain or all covered.
    // Or simpler: Select Top 5 for prototype Parity. 
    // Or standard "Select until no marginal gain".
    
    // Let's implement robust greedy: Always pick site with Max Marginal Gain.
    
    while (covered_count < num_targets) {
        int best_candidate = -1;
        int max_new_coverage = 0;
        
        for (int c = 0; c < num_candidates; c++) {
            // Skip if already selected
            // O(N) check in vector is fine for small K. Setup for Set/Bool array if K large.
            bool already_selected = false;
            for(int s : selected_sites) {
                if(s == c) { already_selected = true; break; }
            }
            if(already_selected) continue;
            
            // Calculate Marginal Gain
            int current_new_coverage = 0;
            const float* row = &coverage_matrix[c * num_targets];
            
            for (int t = 0; t < num_targets; t++) {
                if (!is_target_covered[t] && row[t] > 0.5f) {
                    current_new_coverage++;
                }
            }
            
            if (current_new_coverage > max_new_coverage) {
                max_new_coverage = current_new_coverage;
                best_candidate = c;
            }
        }
        
        if (best_candidate != -1 && max_new_coverage > 0) {
            selected_sites.push_back(best_candidate);
            
            // Mark targets as covered
            const float* best_row = &coverage_matrix[best_candidate * num_targets];
            for (int t = 0; t < num_targets; t++) {
                if (!is_target_covered[t] && best_row[t] > 0.5f) {
                    is_target_covered[t] = true;
                    covered_count++;
                }
            }
        } else {
            // No more gains possible
            break;
        }
        
        // Safety Break for bad loops or massive set
        if (selected_sites.size() >= (size_t)num_candidates) break;
    }
    
    return selected_sites;
}
