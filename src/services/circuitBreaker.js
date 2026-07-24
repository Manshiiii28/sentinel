// Simple in-memory circuit breaker state machine
const states = {}; // { serviceName: { status, failureCount, lastFailureTime } }

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30000; // 30 seconds

function getState(serviceName) {
  if (!states[serviceName]) {
    states[serviceName] = {
      status: 'CLOSED', // CLOSED = healthy, OPEN = blocked, HALF_OPEN = testing
      failureCount: 0,
      lastFailureTime: null,
    };
  }
  return states[serviceName];
}

function recordSuccess(serviceName) {
  const state = getState(serviceName);
  state.status = 'CLOSED';
  state.failureCount = 0;
}

function recordFailure(serviceName) {
  const state = getState(serviceName);
  state.failureCount += 1;
  state.lastFailureTime = Date.now();

  if (state.failureCount >= FAILURE_THRESHOLD) {
    state.status = 'OPEN';
  }
}

function canRequestProceed(serviceName) {
  const state = getState(serviceName);

  if (state.status === 'CLOSED') return true;

  if (state.status === 'OPEN') {
    const elapsed = Date.now() - state.lastFailureTime;
    if (elapsed > COOLDOWN_MS) {
      state.status = 'HALF_OPEN';
      return true; // allow one test request
    }
    return false;
  }

  if (state.status === 'HALF_OPEN') {
    return true;
  }

  return true;
}

module.exports = { canRequestProceed, recordSuccess, recordFailure, getState };