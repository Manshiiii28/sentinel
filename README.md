<div align="center">

# 🛡️ Sentinel

### AI-Powered Adaptive API Gateway

*Real-time traffic protection, powered by distributed systems engineering and machine learning*



![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)




![Redis](https://img.shields.io/badge/Redis-Rate%20Limiting-DC382D?style=for-the-badge&logo=redis&logoColor=white)




![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)




![Python](https://img.shields.io/badge/Python-scikit--learn-3776AB?style=for-the-badge&logo=python&logoColor=white)




![React](https://img.shields.io/badge/React-Dashboard-61DAFB?style=for-the-badge&logo=react&logoColor=black)




![Groq](https://img.shields.io/badge/Groq-LLM%20Explanations-F55036?style=for-the-badge)



</div>

---

## 📖 What is Sentinel?

Sentinel is **infrastructure, not an app** — it sits in front of other APIs and protects them, like a security guard and traffic controller standing at the entrance of a building. Every request that wants in has to pass through Sentinel first.

This isn't a CRUD project that stores and displays data. Sentinel makes **real-time decisions on live traffic**, judges client behavior across thousands of requests over time, builds its rate-limiting logic **from scratch** instead of using a library, and is explicitly engineered to survive concurrency and backend failure.

It's the kind of component real companies like **Cloudflare, Stripe, and Razorpay** run internally to protect their own APIs — built here at a portfolio scale, with production patterns underneath.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🪣 Multi-Algorithm Rate Limiter
Token Bucket **and** Sliding Window, both built from scratch using Redis atomic Lua scripts — not a third-party library.

### 🏢 Multi-Tenant Architecture
Every client gets its own limits, history, and configuration — like a real SaaS product.

### ⚡ Circuit Breaker
A `CLOSED → OPEN → HALF_OPEN` state machine that stops sending traffic to a failing backend and self-heals after a cooldown.

### 🤖 ML Anomaly Detection
A Python microservice running **Isolation Forest** statistically flags abnormal clients by request rate, endpoint diversity, and burst behavior.

</td>
<td width="50%">

### 🧠 AI Explanation Layer
**Groq LLM** (Llama 3.3 70B) turns raw anomaly scores into human-readable alert messages, sent straight to Slack.

### 🌍 IP Reputation Check
Flags VPNs, proxies, and datacenter IPs via a live lookup — informative, not a hard block.

### 📢 Real-Time Slack Alerts
The moment abuse is detected, a message fires to Slack — no one has to be watching a dashboard.

### 🖥️ Live React Dashboard
See every client, the last 20 live requests, and block/unblock anyone with one click.

</td>
</tr>
</table>

---

## 🔄 How a Request Flows Through Sentinel

1. **Authentication** — the client's API key is verified
2. **Circuit breaker check** — if the backend is unhealthy, the request is rejected instantly, with zero calls made to the backend
3. **ML anomaly check** — the request pattern is scored by the Isolation Forest model
4. **IP reputation check** — the source IP is checked for proxy/VPN/datacenter signals
5. **Rate limiting** — Token Bucket or Sliding Window (per client, Redis-backed, atomic)
6. **Forward + log** — if everything passes, the request reaches the real backend and every decision is logged
7. **Alert** — if anything looked suspicious anywhere in the pipeline, Groq writes a plain-English explanation and Slack gets notified immediately

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Gateway / Backend** | Node.js, Express |
| **Rate-limit state** | Redis (atomic Lua scripts) |
| **Persistent storage** | MongoDB Atlas |
| **ML anomaly model** | Python, scikit-learn, Isolation Forest, Flask |
| **AI explanations** | Groq API (`llama-3.3-70b-versatile`) |
| **Authentication** | Per-client API keys |
| **Dashboard** | React + Vite |
| **Alerting** | Slack Incoming Webhooks |
| **Monitoring** | Custom `/metrics` endpoint (Prometheus format) |
| **Load testing** | Autocannon |

---

## 📊 Load Test Results

Benchmarked with **Autocannon** — 100 concurrent connections sustained over 10 seconds:

| Metric | Result |
|---|---|
| ✅ Requests completed | **585** |
| ❌ Failed requests | **0** |
| ⚡ Avg throughput | **~48.5 req/sec** |
| 📉 Avg latency | ~1.8s under full load |

> **Engineering insight:** load testing surfaced a real bottleneck — synchronous request logging and external API calls (IP lookup, AI explanation) add latency under concurrent load. A production version would move these to an async queue rather than blocking the response.

---

## 🖥️ Dashboard Preview

The live dashboard shows every registered client with its algorithm, rate limit, and status, plus a real-time feed of the last 20 requests with pass/fail/flagged outcomes — auto-refreshing every few seconds.

---

## 🚀 Getting Started

```bash
git clone https://github.com/Manshiii28/sentinel.git
cd sentinel
npm install
cp .env.example .env   # add your MongoDB URI, Redis URL, Groq key, Slack webhook
npm run dev

The gateway runs on http://localhost:5000.
🔗 Related Repositories
Repo
Purpose
sentinel-ml
Python Isolation Forest anomaly detection microservice
sentinel-dashboard
React live-monitoring dashboard
🗺️ Roadmap
[ ] JWT-based auth alongside API keys
[ ] Deploy to Render/Railway with a public live demo
[ ] Verify distributed rate limiting under sustained multi-instance load
[ ] Move logging and external API calls to an async queue for higher throughput
�

👩‍💻 Author
Manshi Kumari
B.Tech CSE Student · Backend Systems & Applied ML
