# PLAN-rf-engine-features.md

## Overview

Implement the "Elevation Scan" (Multi-node coverage) and "RF Simulator" (Multi-objective optimization) tools for MeshRF. This involves a major architectural upgrade to an asynchronous worker pattern using Celery + Redis to handle computationally intensive tasks (NSGA-II optimization, batch viewsheds) without blocking the API.

## Project Type

**HYBRID** (Backend Scientific Computing + Frontend Visualization)

## Success Criteria

1.  **Async Architecture**: Long-running jobs handled by Celery workers with real-time SSE progress updates.
2.  **Elevation Scan**: Greedy algorithm places 2-10 nodes for max coverage in < 15s.
3.  **RF Simulator**: Multi-objective optimization (Coverage, Cost, Reliability) using NSGA-II.
4.  **No Regressions**: Existing single-site tools (Viewshed, RF Coverage, Link) continue to function or are migrated to the new async pattern.

## Tech Stack

- **Backend**: Python 3.10+, FastAPI (API), Celery (Workers), Redis (Broker/Cache)
- **Scientific**: `pymoo` (Optimization), `networkx` (Graph Theory), `numba` (JIT Acceleration), `numpy` (Vectorization)
- **Frontend**: React, `zustand` (State), `deck.gl` (Visualization), `sse.js` (Streaming)
- **Infrastructure**: Docker Compose (Multi-container orchestration)

## File Structure

```
root/
├── rf-engine/             # Exisiting Python Service (Refactored)
│   ├── api/               # FastAPI endpoints
│   ├── worker/            # Celery worker entrypoint
│   ├── tasks/             # Async task definitions
│   │   ├── viewshed.py    # Batch viewshed logic
│   │   └── optimize.py    # NSGA-II logic
│   ├── core/              # Shared scientific logic
│   │   ├── algorithms.py  # Greedy & Genetic Algos
│   │   └── physics.py     # Propagation models
│   └── models.py          # Pydantic models (NodeConfig, etc)
├── src/                   # Frontend
│   ├── store/             # Zustand stores (useSimulationStore)
│   ├── components/
│   │   ├── Manager/       # New Node/Scenario Manager UI
│   │   └── Simulation/    # Optimization Control Panels
└── docker-compose.yml     # Updated with worker service
```

## Task Breakdown

### Phase 0: Infrastructure & Async Backbone

**Goal**: Enable long-running tasks and upgrade Python stack.

- [x] **Docker Service Update** <!-- id: 0 -->
  - **Detailed**: Add `worker` service to `docker-compose.yml` (replicas of `rf-engine` running Celery). Add `redis` persistence if not present.
  - **Agent**: `devops-engineer`
  - **Verify**: `docker-compose up` shows API and Worker connecting to Redis.

- [x] **Python Dependency Upgrade** <!-- id: 1 -->
  - **Detailed**: Add `celery`, `redis`, `pymoo`, `networkx`, `scikit-learn`, `numba` to `rf-engine/requirements.txt`.
  - **Agent**: `backend-specialist`
  - **Verify**: Container builds successfully with new libs.

- [x] **Celery Config & SSE Endpoint** <!-- id: 2 -->
  - **Detailed**: Configure Celery in `rf-engine`. Implement `GET /api/events` (or similar) for SSE stream using `sse-starlette`.
  - **Agent**: `backend-specialist`
  - **Verify**: `curl` to SSE endpoint holds connection open.

- [x] **Refactor Existing Tools (Optional/Hybrid)** <!-- id: 3 -->
  - **Detailed**: Ensure existing synchronous endpoints (`/api/elevation`, `/api/link`) still work. Wrap them in Celery _only_ if they block the event loop significantly.
  - **Agent**: `backend-specialist`
  - **Verify**: Existing frontend tools still function.

### Phase 1: Multi-node Elevation Scan (Greedy)

**Goal**: "Best Site Analysis" - Place N nodes for max coverage.

- [x] **Data Models (NodeCollection)** <!-- id: 4 -->
  - **Detailed**: Create Pydantic models for `NodeConfig`, `NodeCollection`, `CoverageResult`.
  - **Agent**: `backend-specialist`
  - **Verify**: Models validate JSON payloads correctly.

- [x] **Batch Viewshed Task** <!-- id: 5 -->
  - **Detailed**: Implement `tasks.calculate_batch_viewshed`. Use `numpy` for fast bitmap storage in Redis.
  - **Agent**: `backend-specialist` / `performance-optimizer`
  - **Verify**: Unit test generates 10 viewsheds and stores keys in Redis.

- [x] **Greedy Coverage Algorithm** <!-- id: 6 -->
  - **Detailed**: Implement `algorithms.greedy_max_coverage`. Select top N sites from candidates.
  - **Agent**: `backend-specialist`
  - **Verify**: Test with synthetic data returns expected top sites.

- [x] **Frontend Node Manager UI** <!-- id: 7 -->
  - **Detailed**: UI to add/import list of candidate nodes (CSV/Manual).
  - **Agent**: `frontend-specialist`
  - **Verify**: Can add 5 candidate markers to map.

- [x] **Frontend Simulation Runner** <!-- id: 8 -->
  - **Detailed**: "Run Analysis" button -> OST to API -> Listen to SSE -> Render Composite Overlay.
  - **Agent**: `frontend-specialist`
  - **Verify**: End-to-end greedy placement visualization and result list panel.

### Phase 2: Network Topology & Link Budget

**Goal**: Verify connectivity between placed nodes.

- [ ] **Link Budget Engine** <!-- id: 9 -->
  - **Detailed**: Port `rfMath.js` and Link logic to Python `physics.py` for authoritative checks.
  - **Agent**: `backend-specialist`
  - **Verify**: Python calculations match existing JS results ±1dB.

- [ ] **Network Graph Logic** <!-- id: 10 -->
  - **Detailed**: Build `networkx` graph from node positions + link viability. Calculate connectivity, islands, diameter.
  - **Agent**: `backend-specialist`
  - **Verify**: Unit tests on disconnected vs connected graphs.

- [ ] **Topology Visualization** <!-- id: 11 -->
  - **Detailed**: Draw lines between connected nodes. Color code by Link Margin / SNR.
  - **Agent**: `frontend-specialist`
  - **Verify**: Visual feedback on valid mesh connections.

### Phase 3: Multi-Objective Optimization (NSGA-II)

**Goal**: "RF Simulator" - Optimize for Cost vs Coverage vs Reliability.

- [ ] **Optimization Problem Definition** <!-- id: 12 -->
  - **Detailed**: Define `pymoo` Problem class. `evaluate()` method calculates (Coverage, Cost, Reliability).
  - **Agent**: `backend-specialist`
  - **Verify**: Problem class can evaluate a single population.

- [ ] **NSGA-II Task Runner** <!-- id: 13 -->
  - **Detailed**: Celery task running `pymoo.minimize`. Stream generation progress via SSE.
  - **Agent**: `backend-specialist`
  - **Verify**: Job finishes and returns Pareto front JSON.

- [ ] **Pareto Front UI** <!-- id: 14 -->
  - **Detailed**: Scatter plot of results (Cost vs Coverage). Click point -> Load Scenario on Map.
  - **Agent**: `frontend-specialist`
  - **Verify**: User can explore trade-offs interactively.

### Phase 4: Polish & Performance

**Goal**: Speed and Reliability.

- [ ] **Numba Acceleration** <!-- id: 15 -->
  - **Detailed**: Decorate hot loops in viewshed/propagation calc with `@njit`.
  - **Agent**: `performance-optimizer`
  - **Verify**: Reduced execution time by >10x.

- [ ] **Viewshed Caching** <!-- id: 16 -->
  - **Detailed**: Robust Redis caching for viewsheds based on (lat, lon, height, params).
  - **Agent**: `backend-specialist`
  - **Verify**: Second run of same area is near-instant.

## Phase X: Verification Checklist

- [ ] **Lint & Type Check**: `flake8`, `mypy`, `npm run lint`.
- [ ] **Security**: Scan for secrets in new worker configs.
- [ ] **Build**: `docker-compose build` passes.
- [ ] **Unit Tests**: Python tests for algorithms pass.
- [ ] **E2E Test**: Full flow: Upload Nodes -> Run Greedy -> View Result -> Run Opt -> View Pareto.
