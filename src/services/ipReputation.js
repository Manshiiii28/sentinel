const axios_fallback = require('http'); // fallback if axios not installed

async function checkIpReputation(ip) {
  // Skip check for localhost/private IPs during local testing
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('::ffff:127')) {
    return { isSuspicious: false, reason: 'local/private IP', raw: null };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,proxy,hosting,country,query`);
    const data = await res.json();

    if (data.status !== 'success') {
      return { isSuspicious: false, reason: 'lookup failed', raw: data };
    }

    const isSuspicious = data.proxy === true || data.hosting === true;

    return {
      isSuspicious,
      reason: isSuspicious ? 'VPN/proxy or datacenter IP detected' : 'clean',
      country: data.country,
      raw: data,
    };
  } catch (err) {
    console.error('IP reputation check failed:', err.message);
    return { isSuspicious: false, reason: 'check error', raw: null };
  }
}

module.exports = { checkIpReputation };