const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const requestsAllowed = new client.Counter({
  name: 'sentinel_requests_allowed_total',
  help: 'Total requests allowed through Sentinel',
});

const requestsDenied = new client.Counter({
  name: 'sentinel_requests_denied_total',
  help: 'Total requests denied by Sentinel',
});

const requestsFlagged = new client.Counter({
  name: 'sentinel_requests_flagged_total',
  help: 'Total requests flagged as suspicious',
});

register.registerMetric(requestsAllowed);
register.registerMetric(requestsDenied);
register.registerMetric(requestsFlagged);

module.exports = { register, requestsAllowed, requestsDenied, requestsFlagged };