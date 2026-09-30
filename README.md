# PetroTwin — Baghewala Field CSS-SRP Digital Twin & Petroleum ERP (SIH PS 26120)

> **Autonomous Digital Twin & Upstream Petroleum ERP Suite for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field (Oil India Limited)**

![Stack](https://img.shields.io/badge/Stack-MERN-green.svg)
![Field](https://img.shields.io/badge/Field-Baghewala_(OIL)-blue.svg)
![Formation](https://img.shields.io/badge/Formation-Jodhpur_Sandstone-orange.svg)
![Crude](https://img.shields.io/badge/Crude_API-16%C2%B0_Heavy_Oil-red.svg)

---

## 1. Executive Summary & Problem Context

Baghewala Field, located in the Bikaner-Nagaur Basin (Rajasthan, India) and operated by **Oil India Limited (OIL)**, holds significant reserves of extra-heavy oil (14°–18° API) trapped in the Cambrian **Jodhpur Sandstone** formation at an average depth of 1,150 meters. 

### Operational Challenges:
- **Extreme Temperature-Viscosity Sensitivity**: Dead oil viscosity is approximately **12,000 cP at 50 °C** and **24,000 cP at 45 °C**, but plunges below **50 cP at steam temperatures (>180 °C)**.
- **Thermal Decay Phase**: As the steam chamber cools over a 60-day CSS cycle, crude viscosity increases exponentially.
- **High-Viscosity Sucker Rod Floating**: During the downstroke, viscous drag on the rod string retards rod fall relative to the carrier bar of the beam pump. If the Variable Frequency Drive (VFD) pumping speed is maintained too high, the polished rod floats off the carrier bar and crashes down, risking catastrophic rod buckling, fatigue failure, and tubing wear.
- **Coupled CSS-SRP Digital Twin**: This project implements an end-to-end, physics-informed digital twin uniting reservoir thermal decline, multiphase heavy-oil inflow performance, downhole Gibbs wave mechanics, and multi-objective Pareto optimization with operator governance.

---

## 2. Core Physics & Petroleum Engineering Formulations

### A. Boberg-Lantz Thermal Reservoir Decline Engine (`thermalEngine.js`)
Models post-soak reservoir cooling over producing time $t$ using the analytical Boberg-Lantz formulation:
$$T(t) = T_{\text{native}} + (T_{\text{steam}} - T_{\text{native}}) \cdot \left[ f_{HD}(t) \cdot f_{VD}(t) \cdot (1 - f_{PD}(t)) - f_{PD}(t) \right]$$
- $f_{HD}(t)$: Horizontal radial conductive heat loss into the surrounding cold reservoir formation.
- $f_{VD}(t)$: Vertical conductive heat loss to the overburden and underburden caprock shales.
- $f_{PD}(t)$: Convective heat loss withdrawn in produced oil and condensed water.

### B. Modified Walther Viscosity-Mobility & Vogel IPR Model (`viscosityEngine.js`)
Dead-oil viscosity $\mu(T)$ is mapped using the modified Walther ASTM D341 equation calibrated to Baghewala crude:
$$\log_{10}(\log_{10}(\nu + 0.7)) = A - B \cdot \log_{10}(T + 273.15)$$
- Calibrated parameters: $A = 11.982$, $B = 4.531$, Specific Gravity = $0.9593$ (16° API).
- Oil mobility: $\lambda_o(T) = \frac{k \cdot k_{ro}}{\mu(T)}$.
- Vogel Composite Inflow Performance Relationship (IPR):
  $$\frac{q_o}{q_{o,\max}} = 1 - 0.2 \left(\frac{P_{wf}}{P_r}\right) - 0.8 \left(\frac{P_{wf}}{P_r}\right)^2$$

### C. Gibbs 1D Damped Wave Equation Solver (`gibbsWaveSolver.js`)
Solves the hyperbolic wave equation along the 1,150 m tapered API Grade D rod string (3/4" and 7/8"):
$$\frac{\partial^2 u}{\partial t^2} = a^2 \frac{\partial^2 u}{\partial x^2} - c \frac{\partial u}{\partial t}$$
- Acoustic speed in steel: $a = 16,000\text{ ft/s}$ ($4,876.8\text{ m/s}$).
- Viscous damping coefficient $c$: Dynamically calculated based on Couette/Poiseuille viscous shear in heavy oil.
- Inverts surface polished rod load vs. position (100 points) into the downhole pump dynacard.
- Calculates Stokes-Couette terminal rod-fall velocity vs. carrier bar downward speed to predict the **Rod Fall Safety Margin**.

### D. Diagnostic Dynacard Classifier (`dynacardClassifier.js`)
- **High-Viscosity Rod Floating**: Severe load drop at top-of-downstroke caused by viscous fluid drag retarding rod fall while barrel maintains liquid fillage.
- **Fluid Pound**: Plunger impact shock due to incomplete barrel fillage.
- **Gas Interference**: Rounded compression corners due to free steam/gas.
- **Normal Full Pump**: Crisp rectangular card with 100% volumetric filling.

### E. Multi-Objective Constrained Pareto Optimizer (`paretoOptimizer.js`)
Vectorized Pareto optimization balancing:
1. Maximize Oil Production (BOPD)
2. Minimize Steam-Oil Ratio (SOR: tonnes CWE / bbl)
3. Minimize Specific Energy (kWh/bbl)
4. Minimize Rod Fatigue Stress Range ($\Delta \sigma$)
- **Constraints**:
  - Peak Polished Rod Load: $\text{PPRL} \le 26,000\text{ lbs}$
  - Minimum Polished Rod Load: $\text{MPRL} \ge 2,000\text{ lbs}$
  - VFD Pumping Speed: $1.5 \le \text{SPM} \le 5.5$
  - Rod Fall Safety Margin $\ge 0\text{ in/s}$ (Prevents carrier bar separation)

---

## 3. Project Directory Hierarchy & Enterprise ERP Modules

```
digital-twin-baghewala-mern/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                       # Mongoose connection to MongoDB Atlas
│   │   ├── models/
│   │   │   ├── Well.js                     # Multi-well portfolio (BAGH-101 to 112)
│   │   │   ├── Telemetry.js                # Daily temperature, viscosity, rates, SPM
│   │   │   ├── Dynacard.js                 # 100-point surface and downhole load arrays
│   │   │   ├── AuditLog.js                 # Immutable history of operator decisions
│   │   │   ├── WorkOrder.js                # CMMS maintenance work orders & diagnostics
│   │   │   ├── Inventory.js                # Spare parts warehouse stock & SKU reorders
│   │   │   ├── TankBattery.js              # Tank storage levels & crude tanker dispatches
│   │   │   ├── SteamBoiler.js              # OTSG steam generation & fuel gas tracking
│   │   │   └── FinancialLedger.js          # Unit lifting cost (₹/bbl) & net margin P&L
│   │   ├── physics/
│   │   │   ├── thermalEngine.js            # Boberg-Lantz cooling calculations
│   │   │   ├── viscosityEngine.js          # Walther viscosity & Vogel IPR
│   │   │   └── gibbsWaveSolver.js          # 1D finite-difference wave equation solver
│   │   ├── services/
│   │   │   ├── dynacardClassifier.js       # Geometric card diagnostic classifier
│   │   │   ├── paretoOptimizer.js          # Multi-objective constrained optimizer
│   │   │   ├── simulationService.js        # Coupled CSS-SRP what-if scenario runner
│   │   │   └── seedDataService.js          # Calibrated Baghewala demonstration dataset
│   │   ├── controllers/
│   │   │   ├── wellController.js           # API route handlers for status, dynacard, simulation
│   │   │   ├── operatorController.js       # Handlers for approvals and audit logging
│   │   │   └── erpController.js            # Handlers for ERP dashboard, CMMS, dispatches, financials
│   │   ├── routes/
│   │   │   ├── wellRoutes.js
│   │   │   ├── operatorRoutes.js
│   │   │   └── erpRoutes.js
│   │   └── server.js                       # Express app entry point & CORS setup
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  # Header with Oil India Baghewala Field badge
│   │   │   ├── ErpSidebar.jsx              # Navigation for all 8 ERP modules & role switcher
│   │   │   ├── ExecutiveDashboard.jsx      # Field-wide KPIs, active wells, and OPEX rollup
│   │   │   ├── WellRegistryView.jsx        # Multi-well portfolio registry & twin quick-launch
│   │   │   ├── ProductionAccountingView.jsx# Tank battery storage gauge & tanker dispatch logger
│   │   │   ├── SteamEnergyView.jsx         # OTSG boilers, steam quality & SOR economics
│   │   │   ├── MaintenanceCmmsView.jsx     # CMMS work orders & spare parts inventory
│   │   │   ├── FinancialOpexView.jsx       # ₹/bbl lifting cost waterfall & net margin
│   │   │   ├── KpiCards.jsx                # Telemetry: Temp, Viscosity, SPM, Risk badge
│   │   │   ├── DynacardViewer.jsx          # Interactive Plotly chart: Surface vs Downhole
│   │   │   ├── ThermalViscosityPlot.jsx    # Dual-axis chart: Temperature vs Viscosity
│   │   │   ├── WhatIfSimulator.jsx         # Live sliders: SPM, Soak Days, Steam CWE
│   │   │   ├── ParetoOptimizerView.jsx     # Multi-objective Pareto trade-off plot
│   │   │   ├── AdvisoryConsole.jsx         # AI advice, physical explanation, action buttons
│   │   │   └── AuditTrailTable.jsx         # Table of operator decisions and timestamps
│   │   ├── services/
│   │   │   └── api.js                      # Axios client calling Express endpoints
│   │   ├── App.jsx                         # Main ERP layout & module tab switcher
│   │   ├── main.jsx
│   │   └── index.css                       # Tailwind CSS styling
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md                               # Petroleum theory, setup instructions, API schema
├── start_demo.sh                           # Shell script to seed MongoDB and start both servers
└── start_demo.bat                          # Windows launcher
```

---

## 4. REST API Specification

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/well/status` | Returns current well telemetry, temperature, viscosity, active SPM, fillage, and diagnostic badge. |
| `GET` | `/well/thermal-history` | Returns 60 days of calibrated thermal cooling, viscosity rise, and production time series. |
| `GET` | `/well/dynacard/current` | Returns 100-point surface and Gibbs wave-inverted downhole dynacards with PPRL/MPRL. |
| `POST` | `/well/simulate` | What-If scenario simulator: accepts `{ spm, steamVolumeTonnes, soakDays, producingDay }`. |
| `GET` | `/well/optimize` | Runs Pareto optimizer and returns non-dominated frontier, recommended SPM, and energy savings. |
| `POST` | `/operator/action` | Commits operator decision (`ACCEPT`, `MODIFY`, `REJECT`) to immutable MongoDB audit trail. |
| `GET` | `/operator/audit-log` | Retrieves chronological history of operator setpoint governance decisions. |

---

## 5. Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0 or higher
- **MongoDB**: (Optional) If local MongoDB is running, it connects to `mongodb://localhost:27017/baghewala_twin`. If no local MongoDB is detected, the backend automatically initializes an in-memory database (`mongodb-memory-server`) with zero external configuration!

### Option A: One-Click Launch Script
- **Linux/macOS**:
  ```bash
  chmod +x start_demo.sh
  ./start_demo.sh
  ```
- **Windows**:
  Double click `start_demo.bat` or run:
  ```powershell
  .\start_demo.bat
  ```

### Option B: Manual Launch
1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm start
   # Server runs on http://localhost:5000
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   # Dashboard opens at http://localhost:3000
   ```

---

## 6. Demonstration Calibration & Provenance Notice
All production, thermal, and dynamometer data generated by this prototype is calibrated to published petrophysical properties of the **Baghewala Field Jodhpur Sandstone**:
`[DEMO / SIMULATED DATASET: CALIBRATED TO BAGHEWALA JODHPUR SANDSTONE]`
