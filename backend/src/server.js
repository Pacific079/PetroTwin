require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedDatabase, DEMO_LABEL } = require('./services/seedDataService');
const wellRoutes = require('./routes/wellRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const erpRoutes = require('./routes/erpRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/well', wellRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/erp', erpRoutes);

// Root & Health Endpoints
app.get('/', (req, res) => {
  res.json({
    project: 'PetroTwin - Upstream Digital Twin & Petroleum ERP (Baghewala Field, OIL)',
    hackathon: 'Smart India Hackathon (SIH) Problem Statement 26120',
    status: 'ONLINE',
    field: 'Baghewala (Western Rajasthan Basin, Jodhpur Sandstone)',
    endpoints: [
      'GET /api/well/status',
      'GET /api/well/thermal-history',
      'GET /api/well/dynacard/current',
      'POST /api/well/simulate',
      'GET /api/well/optimize',
      'POST /api/operator/action',
      'GET /api/operator/audit-log',
    ],
    dataSource: DEMO_LABEL,
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

// Startup Sequence
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`================================================================`);
      console.log(`PETROTWIN BACKEND SERVER RUNNING ON PORT ${PORT}`);
      console.log(`Field: Baghewala (Oil India Limited) | Formation: Jodhpur Sandstone`);
      console.log(`SIH Problem Statement 26120 - Autonomous Heavy Oil CSS/SRP Twin`);
      console.log(`================================================================`);
    });
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
