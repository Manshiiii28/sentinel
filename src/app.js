const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const gatewayRoutes = require('./routes/gateway');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'Sentinel is up' }));

const { register } = require('./services/metrics');

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/admin', adminRoutes);
app.use('/gateway', gatewayRoutes);

module.exports = app;