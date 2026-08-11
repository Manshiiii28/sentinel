async function checkMLAnomaly(requestsPerSec, endpointDiversity, burstScore) {
  try {
    const res = await fetch('https://sentinel-ml-1-6b6g.onrender.com/check-anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests_per_sec: requestsPerSec,
        endpoint_diversity: endpointDiversity,
        burst_score: burstScore,
      }),
    });

    if (!res.ok) throw new Error('ML service error');

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('ML anomaly check failed:', err.message);
    return { is_anomaly: false, anomaly_score: 0 };
  }
}

module.exports = { checkMLAnomaly };
