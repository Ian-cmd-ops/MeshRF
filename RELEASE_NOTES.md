# MeshRF v1.15.5 - Stability & Reliability Patch

**Release Date**: February 15, 2026  
**Type**: Patch Release  
**Focus**: Critical bugfixes, memory leak prevention, and WASM binding corrections

---

## 🎯 Overview

This patch addresses **18 critical stability issues** discovered through systematic code review, including infinite loops, memory leaks, race conditions, silent failures, and a critical WASM binding bug that prevented the ITM propagation model from functioning correctly.

---

## 🐛 Critical Fixes

### Backend (Python - 7 fixes)

| Issue                            | Impact                              | Fix                                       |
| -------------------------------- | ----------------------------------- | ----------------------------------------- |
| **SSE Infinite Loop**            | Open HTTP connections indefinitely  | Added 600-poll max timeout (5 min)        |
| **Silent Exception Swallowing**  | Errors hidden, debugging impossible | Structured logging with error summaries   |
| **False-Positive Perfect Links** | Misleading "100% clearance" reports | Evaluation flag prevents 0-point analysis |
| **ThreadPoolExecutor Leaks**     | Thread count grows unbounded        | `shutdown()` + `__del__()` methods        |
| **Missing Timeouts**             | Indefinite blocking on tile fetches | 30s timeout with `TimeoutError` handling  |
| **Unbounded tile_locks**         | Memory exhaustion over time         | OrderedDict LRU cache (1000 limit)        |
| **Wrong HTTP Status Codes**      | 500 errors for client mistakes      | Differentiated 400 vs 500 responses       |

### Frontend (React/JS - 10 fixes)

| Issue                         | Impact                                         | Fix                                 |
| ----------------------------- | ---------------------------------------------- | ----------------------------------- |
| **Stale Message Listeners**   | Duplicate worker handlers, memory leaks        | Moved handler into `useEffect`      |
| **Stale Closures**            | Infinite re-render loops                       | Restored `configRef` pattern        |
| **Document Listener Leaks**   | Chrome tab memory growth                       | `cleanupRef` tracking               |
| **Missing HTTP Error Checks** | Unhandled promise rejections                   | `response.ok` validation            |
| **Silent WASM Failures**      | Tools silently break                           | `wasmError` state + user feedback   |
| **Scan Double-Submit**        | Duplicate Celery tasks                         | `isScanning` guard                  |
| **Missing Imports**           | Runtime ReferenceErrors                        | Added `useRef`, `useEffect`         |
| **Infinite Loop (Post-Fix)**  | Max update depth exceeded                      | Removed `runAnalysis` from deps     |
| **Model Selection**           | Changing propagation model doesn't recalculate | Added `propagationSettings` to deps |

### WASM/C++ (1 fix)

| Issue                          | Impact                                       | Fix                                                       |
| ------------------------------ | -------------------------------------------- | --------------------------------------------------------- |
| **LinkParameters Constructor** | "Module.LinkParameters is not a constructor" | Changed `value_object` → `class_` with `.constructor<>()` |

---

## 📦 Deployment

### Updated Files

- **Backend**: `server.py`, `rf_physics.py`, `core/algorithms.py`, `tile_manager.py`
- **Frontend**: `useViewshedTool.js`, `LinkLayer.jsx`, `LinkAnalysisPanel.jsx`, `rfService.js`, `useRFCoverageTool.js`, `useSimulationStore.js`
- **WASM**: `libmeshrf/src/bindings.cpp`, `meshrf.wasm` (109KB), `meshrf.js` (48KB)

### Verification

- ✅ Frontend build successful
- ✅ Python syntax validated
- ✅ WASM module compiled (100%)
- ✅ Runtime errors resolved

---

## 🚀 Upgrade Instructions

### Development

```bash
# Frontend (uses Vite HMR - no restart needed)
# Code changes already live via volume mount

# Backend - restart to reload Python modules
docker restart rf_engine_dev

# Hard refresh browser to load new WASM
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Production

```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose build

# Restart stack
docker-compose up -d
```

---

## 🔍 Testing Recommendations

1. **Link Analysis**: Test ITM (Longley-Rice) propagation model - should no longer throw constructor errors
2. **Long-Running Scans**: Verify SSE endpoints timeout gracefully after 5 minutes
3. **Memory Monitoring**: Check thread count and Redis tile cache remain bounded
4. **Error Visibility**: Confirm viewshed errors appear in logs instead of being silently swallowed
5. **Multi-Click Protection**: Spam-click "Start Scan" button - should only run once

---

## 📊 Impact Summary

| Category            | Fixes | Severity    |
| ------------------- | ----- | ----------- |
| **Infinite Loops**  | 1     | 🔴 Critical |
| **Memory Leaks**    | 3     | 🔴 Critical |
| **Silent Failures** | 4     | 🟠 High     |
| **Race Conditions** | 2     | 🟠 High     |
| **Error Handling**  | 4     | 🟡 Medium   |
| **Import Errors**   | 3     | 🟡 Medium   |

**Total**: 18 issues resolved

---

## 🙏 Acknowledgments

All issues identified through systematic code review and production debugging. Special attention given to resource management (threads, listeners, locks) and React hook dependency management.

---

**Full Changelog**: [CHANGELOG.md](CHANGELOG.md)  
**Previous Release**: [v1.15.4](https://github.com/d3mocide/MeshRF/releases/tag/v1.15.4)
