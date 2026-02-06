# Release v1.8.0: The "Physics Purist" Upgrade 📡

This major release overhauls the RF propagation engine, shifting the "Center of Physics" from the browser to a high-fidelity Python backend. It introduces the industry-standard **Longley-Rice (ITM)** model and ensures mission-critical accuracy for link planning.

## 🌟 Key Features

### 1. New Propagation Models

- **Longley-Rice (ITM)**: Now the **Default** model. Uses high-fidelity Bullington Diffraction (Knife-Edge) to accurately model signal loss over irregular terrain (hills, ridges, valleys). This is a massive upgrade from simple Line-of-Sight checks.
- **Okumura-Hata (Server-Side)**: Fully ported the statistical urban model to the Python backend. ideal for city usage where buildings dominate.
- **Free Space (Optimistic)**: Retained as a baseline for comparison.

### 2. Architecture Overhaul

- **Python-First Physics**: All RF path loss calculations now run on `rf-engine` (FastAPI) using `NumPy` and `SciPy`. The Frontend is now a lightweight visualization layer.
- **Async Calculation**: Complex terrain analysis runs asynchronously, keeping the UI silky smooth even for long-distance link checks.

### 3. UI/UX Polish

- **Link Analysis Panel**: Redesigned to support Model Selection and Environment Tuning.
- **Expanded Layout**: Wider and taller panel defaults (380x620px) to accommodate detailed charts and controls.
- **Dynamic Legend**: Interactive tooltips and status indicators updated to reflect the selected physics model.

## 🛠️ Technical Details

- **Backend**: Added `calculate_path_loss` dispatcher and `calculate_bullington_loss` implementation.
- **Frontend**: Refactored `rfMath.js` to remove legacy client-side math.
- **Dependencies**: Added `pyitm` (future proofing) and optimized `scipy` usage.

## 🚀 How to Upgrade

1. Pull the latest changes: `git pull origin main`
2. Rebuild the engine container: `docker compose build rf-engine`
3. Restart services: `docker compose up -d`
