import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ErpSidebar from './components/ErpSidebar';
import LandingHero from './components/LandingHero';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import WellRegistryView from './components/WellRegistryView';
import ProductionAccountingView from './components/ProductionAccountingView';
import SteamEnergyView from './components/SteamEnergyView';
import MaintenanceCmmsView from './components/MaintenanceCmmsView';
import FinancialOpexView from './components/FinancialOpexView';

// Digital Twin SCADA Components
import KpiCards from './components/KpiCards';
import DynacardViewer from './components/DynacardViewer';
import ThermalViscosityPlot from './components/ThermalViscosityPlot';
import WhatIfSimulator from './components/WhatIfSimulator';
import ParetoOptimizerView from './components/ParetoOptimizerView';
import AdvisoryConsole from './components/AdvisoryConsole';
import AuditTrailTable from './components/AuditTrailTable';

import api from './services/api';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('hero'); // Default to Reference Hero Landing View!
  const [userRole, setUserRole] = useState('Senior Production Engineer (Shift A)');

  // Digital Twin state
  const [wellStatus, setWellStatus] = useState(null);
  const [thermalHistory, setThermalHistory] = useState([]);
  const [activeDynacard, setActiveDynacard] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);

  // ERP state
  const [erpDashboard, setErpDashboard] = useState(null);
  const [wellsPortfolio, setWellsPortfolio] = useState([]);
  const [batteryData, setBatteryData] = useState(null);
  const [steamBoilers, setSteamBoilers] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [financials, setFinancials] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        statusRes,
        historyRes,
        dynacardRes,
        optRes,
        auditRes,
        erpDashRes,
        wellsRes,
        prodRes,
        steamRes,
        woRes,
        invRes,
        finRes,
      ] = await Promise.all([
        api.getWellStatus(),
        api.getThermalHistory(),
        api.getCurrentDynacard(),
        api.getOptimization(),
        api.getAuditLog(),
        api.getErpDashboard().catch(() => null),
        api.getWellsPortfolio().catch(() => null),
        api.getProductionAccounting().catch(() => null),
        api.getSteamEnergy().catch(() => null),
        api.getWorkOrders().catch(() => null),
        api.getInventory().catch(() => null),
        api.getFinancials().catch(() => null),
      ]);

      setWellStatus(statusRes);
      setThermalHistory(historyRes?.history || []);
      setActiveDynacard(dynacardRes);
      setOptimizationData(optRes?.optimization);
      setAuditLogs(auditRes?.logs || []);

      if (erpDashRes?.data) setErpDashboard(erpDashRes);
      if (wellsRes?.wells) setWellsPortfolio(wellsRes.wells);
      if (prodRes?.battery) setBatteryData(prodRes);
      if (steamRes?.boilers) setSteamBoilers(steamRes.boilers);
      if (woRes?.workOrders) setWorkOrders(woRes.workOrders);
      if (invRes?.inventory) setInventory(invRes.inventory);
      if (finRes?.financials) setFinancials(finRes);

      setSimulationResult({
        oilRateBopd: statusRes.oilRateBopd,
        rodFallSafetyMargin: statusRes.rodFallSafetyMargin,
        isRodFloating: statusRes.isRodFloating,
        rodFloatProbability: statusRes.rodFloatProbability,
        electricPowerKw: statusRes.electricPowerKw,
        kwhPerBbl: statusRes.kwhPerBbl,
        viscosityCp: statusRes.viscosityCp,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast('Error syncing with backend server.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time What-If Simulation Runner
  const handleSimulate = async (params) => {
    try {
      const res = await api.simulateScenario(params);
      if (res.success && res.simulation) {
        setSimulationResult(res.simulation);
        setActiveDynacard({
          surfaceCard: res.simulation.surfaceCard,
          downholeCard: res.simulation.downholeCard,
          pprlLbs: res.simulation.pprlLbs,
          mprlLbs: res.simulation.mprlLbs,
          rodFallSafetyMargin: res.simulation.rodFallSafetyMargin,
          isRodFloating: res.simulation.isRodFloating,
          dampingCoefficient: res.simulation.dampingCoefficient,
          diagnostic: res.simulation.diagnostic,
        });
      }
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  // Commit Operator Action (ACCEPT / MODIFY / REJECT)
  const handleOperatorAction = async (actionData) => {
    try {
      setActionLoading(true);
      const res = await api.recordOperatorAction(actionData);
      if (res.success) {
        showToast(res.message, 'success');
        await loadDashboardData();
      }
    } catch (err) {
      console.error('Operator action error:', err);
      showToast(err.response?.data?.error || 'Failed to record action.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplySpm = (spm) => {
    handleSimulate({
      spm,
      steamVolumeTonnes: wellStatus?.steamBaseline?.steamVolumeTonnes || 2000,
      soakDays: wellStatus?.steamBaseline?.soakDays || 10,
      producingDay: wellStatus?.currentProducingDay || 38,
    });
    showToast(`Loaded ${spm} SPM into simulator. Click "Approve Setpoint" in Advisory Console to commit.`, 'info');
  };

  const handleCreateDispatch = async (dispatchData) => {
    try {
      setActionLoading(true);
      const res = await api.createDispatchManifest(dispatchData);
      if (res.success) {
        showToast(`Manifest ${res.manifest.manifestId} created! Dispatched ${res.manifest.volumeBbl} bbl.`, 'success');
        const prod = await api.getProductionAccounting();
        setBatteryData(prod);
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      showToast('Failed to create dispatch manifest.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateWorkOrder = async (woData) => {
    try {
      setActionLoading(true);
      const res = await api.createWorkOrder(woData);
      if (res.success) {
        showToast(`Work Order ${res.workOrder.orderNumber} issued successfully!`, 'success');
        const wo = await api.getWorkOrders();
        setWorkOrders(wo.workOrders || []);
      }
    } catch (err) {
      console.error('Work order creation error:', err);
      showToast('Failed to issue work order.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateWoStatus = async (id, status) => {
    try {
      const res = await api.updateWorkOrderStatus(id, status);
      if (res.success) {
        showToast(`Work Order status updated to ${status}.`, 'info');
        const wo = await api.getWorkOrders();
        setWorkOrders(wo.workOrders || []);
      }
    } catch (err) {
      console.error('Update status error:', err);
      showToast('Failed to update work order.', 'error');
    }
  };

  const isRodFloating = wellStatus?.isRodFloating;
  const openWoCount = workOrders.filter((w) => w.status !== 'CLOSED' && w.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-slate-800 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 font-mono text-xs transition-all animate-bounce ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : toastMessage.type === 'info'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-emerald-50 text-emerald-900 border-emerald-300'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Neumorphic Navigation Bar */}
      <Navbar
        wellStatus={wellStatus}
        onRefresh={loadDashboardData}
        loading={loading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Neumorphic ERP Sidebar */}
        <ErpSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openWorkOrdersCount={openWoCount}
          criticalAlert={isRodFloating}
          userRole={userRole}
          onRoleChange={setUserRole}
        />

        {/* Content View Area */}
        <main className="flex-1 max-w-7xl w-full p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* TAB 0: REFERENCE LANDING HERO PORTAL (Matches User Image) */}
          {activeTab === 'hero' && (
            <LandingHero
              onLaunchTwin={() => setActiveTab('digital_twin')}
              onLaunchErp={() => setActiveTab('executive')}
              wellStatus={wellStatus}
              isRodFloating={isRodFloating}
            />
          )}

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'executive' && (
            <ExecutiveDashboard
              dashboardData={erpDashboard}
              onNavigate={setActiveTab}
              isRodFloating={isRodFloating}
            />
          )}

          {/* TAB 2: DIGITAL TWIN & REAL-TIME SCADA */}
          {activeTab === 'digital_twin' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Row 1: KPI Telemetry Cards */}
              <KpiCards status={wellStatus} />

              {/* Row 2: Dynacard Wave Inversion & Thermal History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DynacardViewer
                  dynacardData={activeDynacard}
                  title={`Real-Time Dynacard Inversion (${wellStatus?.wellId || 'BAGH-104'})`}
                />
                <ThermalViscosityPlot
                  history={thermalHistory}
                  currentDay={wellStatus?.currentProducingDay || 38}
                />
              </div>

              {/* Row 3: What-If Parameter Sliders & Pareto Frontier */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WhatIfSimulator
                  currentValues={{
                    spm: wellStatus?.activeSpm || 4.2,
                    steamVolumeTonnes: 2000,
                    soakDays: 10,
                    producingDay: wellStatus?.currentProducingDay || 38,
                  }}
                  onSimulate={handleSimulate}
                  simulationResult={simulationResult}
                  loading={loading}
                />
                <ParetoOptimizerView
                  optimizationData={optimizationData}
                  onApplySpm={handleApplySpm}
                />
              </div>

              {/* Row 4: Agentic Advisory Console */}
              <AdvisoryConsole
                status={wellStatus}
                optimizationData={optimizationData}
                onOperatorAction={handleOperatorAction}
                actionLoading={actionLoading}
              />
            </div>
          )}

          {/* TAB 3: WELL PORTFOLIO REGISTRY */}
          {activeTab === 'wells' && (
            <WellRegistryView
              wells={wellsPortfolio}
              onSelectWellForTwin={() => setActiveTab('digital_twin')}
            />
          )}

          {/* TAB 4: PRODUCTION & TANK BATTERY */}
          {activeTab === 'production' && (
            <ProductionAccountingView
              batteryData={batteryData}
              onDispatch={handleCreateDispatch}
              actionLoading={actionLoading}
            />
          )}

          {/* TAB 5: STEAM & ENERGY (CSS) */}
          {activeTab === 'steam' && (
            <SteamEnergyView boilers={steamBoilers} />
          )}

          {/* TAB 6: MAINTENANCE & CMMS */}
          {activeTab === 'maintenance' && (
            <MaintenanceCmmsView
              workOrders={workOrders}
              inventory={inventory}
              onCreateWorkOrder={handleCreateWorkOrder}
              onUpdateStatus={handleUpdateWoStatus}
              actionLoading={actionLoading}
              isRodFloating={isRodFloating}
            />
          )}

          {/* TAB 7: FINANCIALS & OPEX */}
          {activeTab === 'financials' && (
            <FinancialOpexView financialData={financials} />
          )}

          {/* TAB 8: AUDIT & COMPLIANCE */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-fadeIn">
              <AuditTrailTable logs={auditLogs} loading={loading} />
            </div>
          )}

          {/* Footnote */}
          <footer className="pt-6 pb-6 text-center text-xs font-mono text-slate-500 border-t border-[#dfd6c4]/60 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              [DEMO DATASET: CALIBRATED TO BAGHEWALA JODHPUR SANDSTONE]
            </span>
            <span>
              Neumorphic Petroleum ERP • Oil India Limited (OIL)
            </span>
            <span className="text-orange-700 font-bold">
              SIH Problem Statement 26120
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
