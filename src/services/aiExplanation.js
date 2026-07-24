const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function explainAnomaly(context) {
  try {
    const prompt = `You are a security analyst. Explain this API client's behavior in ONE short, plain-English sentence for a dashboard alert. Be direct and specific.

Context: ${context}

Reply with ONLY the explanation sentence, nothing else.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 60,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Unable to generate explanation.';
  } catch (err) {
    console.error('Groq explanation error:', err.message);
    return 'AI explanation unavailable.';
  }
}

module.exports = { explainAnomaly };