async function sendSlackAlert(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured, skipping alert');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  } catch (err) {
    console.error('Failed to send Slack alert:', err.message);
  }
}

module.exports = { sendSlackAlert };