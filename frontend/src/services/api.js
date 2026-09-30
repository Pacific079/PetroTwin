import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Well Status & Telemetry
  getWellStatus: async () => {
    const res = await apiClient.get('/well/status');
    return res.data;
  },

  getThermalHistory: async () => {
    const res = await apiClient.get('/well/thermal-history');
    return res.data;
  },

  getCurrentDynacard: async () => {
    const res = await apiClient.get('/well/dynacard/current');
    return res.data;
  },

  // What-If Simulation
  simulateScenario: async (params) => {
    const res = await apiClient.post('/well/simulate', params);
    return res.data;
  },

  // Pareto Optimizer
  getOptimization: async () => {
    const res = await apiClient.get('/well/optimize');
    return res.data;
  },

  // Operator Actions & Audit Trail
  recordOperatorAction: async (actionData) => {
    const res = await apiClient.post('/operator/action', actionData);
    return res.data;
  },

  getAuditLog: async () => {
    const res = await apiClient.get('/operator/audit-log');
    return res.data;
  },

  // ==========================================
  // Upstream Petroleum ERP Suite APIs
  // ==========================================
  getErpDashboard: async () => {
    const res = await apiClient.get('/erp/dashboard');
    return res.data;
  },

  getWellsPortfolio: async () => {
    const res = await apiClient.get('/erp/wells');
    return res.data;
  },

  getProductionAccounting: async () => {
    const res = await apiClient.get('/erp/production');
    return res.data;
  },

  createDispatchManifest: async (dispatchData) => {
    const res = await apiClient.post('/erp/dispatch', dispatchData);
    return res.data;
  },

  getSteamEnergy: async () => {
    const res = await apiClient.get('/erp/steam-energy');
    return res.data;
  },

  getWorkOrders: async (filters = {}) => {
    const res = await apiClient.get('/erp/work-orders', { params: filters });
    return res.data;
  },

  createWorkOrder: async (workOrderData) => {
    const res = await apiClient.post('/erp/work-orders', workOrderData);
    return res.data;
  },

  updateWorkOrderStatus: async (id, status) => {
    const res = await apiClient.patch(`/erp/work-orders/${id}`, { status });
    return res.data;
  },

  getInventory: async () => {
    const res = await apiClient.get('/erp/inventory');
    return res.data;
  },

  getFinancials: async () => {
    const res = await apiClient.get('/erp/financials');
    return res.data;
  },
};

export default api;
