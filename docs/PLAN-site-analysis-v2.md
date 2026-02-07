# PLAN: Site Analysis v2 (Predictive Placement)

## Overview

Shift Site Analysis from a reactive tool (analyzing points you pick) to a proactive tool (suggesting points you missed). This involves visualizing the scoring engine's "brain" and pre-calculating optimal regions.

## Core Features

### 1. RF Heatmap Mode (Pre-Placement)

- **Goal**: Show "good" areas before the user clicks.
- **Implementation**:
  - Perform a coarse grid scan of the visible map area (e.g., 20x20).
  - Calculate a combined score (Elevation + Prominence) for each cell.
  - Render a `DeckGL` Heatmap/Filtered layer over the terrain.
- **Benefit**: Guides the user to place manual candidate nodes in areas with high success probability.

### 2. Analysis Scoring Visualization

- **Goal**: Show _why_ a site was selected by the Greedy Optimizer.
- **Implementation**:
  - Update `SiteAnalysisResultsPanel` to show a breakdown chart (radar or bars) for each result.
  - Metrics:
    - **Height**: Raw elevation score.
    - **Prominence**: Local peak score.
    - **Connectivity (Fresnel)**: Visibility to the rest of the network.
- **Benefit**: Provides transparency and builds user trust in the algorithm.

### 3. Integrated Optimization Workflow

- **Mode Decoupling**:
  - **Step 1: Selection Strategy**: Toggle between "Manual Selection" (I pick the candidates) and "Automated Search" (The grid picks them).
  - **Step 2: Pruning**: Define how many "Winners" to keep (Greedy Count).
- **Benefit**: Reduces cognitive load by separating "Where to look" from "How many to keep."

## Technical Roadmap

- [ ] **Backend (Python)**:
  - Optimize `optimization_service.py` with `Numba` to handle larger grid scans (30x30+).
  - Add a `score_grid` endpoint that returns a weighted importance map.
- [ ] **Frontend (React/DeckGL)**:
  - Create `HeatmapLayer` in `DeckGLOverlay.jsx`.
  - Implement the "Scoring Breakdown" UI in `SiteAnalysisResultsPanel.jsx`.

## Success Criteria

- [ ] User can identify the best hill in a valley without clicking every peak.
- [ ] Grid scan for 5km radius finishes in under 5 seconds.
- [ ] Clear visual feedback on why Node A was chosen over Node B.
