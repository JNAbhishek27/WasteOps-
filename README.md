# WasteOps: Autonomous AI Agent for Smart Waste Collection Operations

> **Hackathon Track**: The Taskmaster (All Things Agentic Hackathon)  
> **Live Demo URL**: [Launch WasteOps](https://ais-pre-qbc7eo2bqu36oyppupv3zl-1000591823797.asia-southeast1.run.app)  
> **AI Architecture**: Event-Driven Multi-Agent Framework powered by Gemini 3.7 Flash & 13 Specialized Tools

---

## 🌟 Executive Summary

**WasteOps** is an autonomous multi-agent operational platform designed for municipal public works departments and commercial waste operators. It transforms passive IoT sensor monitoring into proactive, closed-loop municipal execution without human bottlenecks.

When smart waste bins experience sudden fill surges or sensor anomalies, WasteOps autonomously **perceives**, **triages**, **recalls historical surge patterns**, **optimizes vehicle routes**, **dispatches tasks**, **triggers human-in-the-loop approvals for critical missions**, and **verifies physical collection via post-service sensor drops**.

```
[IoT Telemetry / Events] 
          │
          ▼
┌─────────────────────────┐
│  WasteOps Orchestrator  │ ◄───► [Gemini 3.7 Flash + Tool Calling]
└───────────┬─────────────┘
            │
  ┌─────────┼─────────────────────────┬─────────────────────────┐
  ▼         ▼                         ▼                         ▼
┌────────┐ ┌────────────────┐ ┌───────────────────┐ ┌──────────────────────┐
│ Triage │ │  Route & Fleet │ │  Human Approval   │ │ Closed-Loop Sensor   │
│ Agent  │ │  Optimizer     │ │  Guardrail Center │ │ Verification Agent   │
└────────┘ └────────────────┘ └───────────────────┘ └──────────────────────┘
```

---

## 🎯 "The Taskmaster" Track Alignment Checklist

WasteOps was constructed from the ground up to address all core evaluation pillars of **The Taskmaster** hackathon track:

| Requirement | Implementation in WasteOps |
| :--- | :--- |
| **Event-Driven Workflows** | Built-in async EventBus & Pub/Sub architecture listening to real-time IoT fill updates, battery drops, and citizen overflow tickets. |
| **Autonomous Decision-Making** | Dynamic triage assessing velocity (fill rate/hr), calculating exact minutes to overflow, and prioritizing high-density municipal corridors. |
| **Multi-Step Execution Pipeline** | `PERCEPTION → TRIAGE → MEMORY → ROUTING → ACTION → APPROVAL → VERIFICATION` executing sequentially with non-blocking async loops. |
| **13 Specialized Tools** | Structured tool definitions (`get_bin_status`, `optimize_route`, `create_collection_task`, `verify_collection`, `request_human_approval`, etc.) enabling precise API invocation. |
| **Persistent State & Memory** | Firestore / persistence adapter maintaining state across 30 municipal bins, 5 fleet vehicles, tasks, approvals, and semantic surge memories. |
| **Human-in-the-Loop (HITL)** | High-risk dispatches (hazards, critical overflow >90%, multi-bin rerouting) require supervisor sign-off with approve/reject/modify actions. |
| **Closed-Loop Verification** | The Verification Agent audits post-service IoT telemetry drops (confirming fill level cleared <20%) before resolving any work order. |
| **Prompt Injection Defense** | Input sanitization filter and structured tool validation preventing malicious payload exploits in natural language commands. |

---

## 🚀 Key Features

### 1. Executive Operations Dashboard
- **Real-Time KPIs**: Critical Bins Count, Overflow Risk Index, Active Fleets, Pending Approvals, Verified Collections, and Response Time Saved (hours).
- **Live Incident Banner**: Instant visual broadcast of urgent municipal emergencies with 1-click autonomous resolution triggers.
- **Municipal Zone Health**: Visual distribution breakdown across 7 urban zones (Downtown, Financial District, SOMA, Mission District, Castro, Marina, Presidio).

### 2. Interactive 30-Node Municipal Map
- **Visual Node Telemetry**: Vector-based geospatial map color-coded by real-time status (Healthy, Moderate, Near Capacity, Critical Overflow, Sensor Offline).
- **Fleet Proximity & Route Paths**: Real-time vehicle positions, current assignments, battery status, and capacity gauges.
- **Side Telemetry Inspector**: Deep-dive on historical fill trends, address data, collection history, and direct sensor simulation controls.

### 3. Agent Activity & Execution Trace
- **Live 7-Phase Execution Visualizer**: Step-by-step audit logging of agent thought processes, tool invocations, and confidence ratings.
- **Decision History Ledger**: Transparent and filterable record of every dispatch, route re-optimization, and human override with full reasoning logs.

### 4. Human-in-the-Loop Approval Center
- **Supervisor Workflow**: Critical dispatches (>90% fill, hazardous materials, battery drains) prompt interactive approval cards with full agent justifications.
- **Route Modification**: Operators can approve, decline with reasons, or adjust assigned vehicle crews directly.

### 5. Closed-Loop Telemetry Verification
- **Automated Drop Auditing**: Once a driver marks a task completed, the agent validates whether physical sensor readings dropped to baseline.
- **Anti-Cheat & Re-dispatch**: If sensor levels remain elevated after reported collection, the agent automatically flags an anomaly and creates a re-inspection ticket.

### 6. Interactive Data Simulator & 60-Second Judge Demo Flow
- **One-Click Choreographed Demo**: 8-step guided walkthrough covering baseline normal, surge spike, triage reasoning, route optimization, HITL approval, and post-drop verification.
- **Instant Presets**: *Normal Day*, *Overflow Crisis*, *Sensor Failure*, *Fleet Shortage*, and *City-Wide 20-Bin Surge*.
- **Adversarial Guardrail Tester**: Live testing sandbox for testing prompt injections and system instruction overrides.

### 7. Natural Language Agent Console
- Interactive slide-out command terminal powered by **Gemini 3.7 Flash** for operational queries (e.g., *"Why is BIN-104 critical?"*, *"Which trucks are available near SOMA?"*, *"Reroute TRUCK-02 to urgent tasks"*).

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Backend & Middleware**: Node.js Express, Tsx, ESBuild bundled server running on Port 3000.
- **AI / LLM Engine**: Gemini 3.7 Flash via `@google/genai` with deterministic local reasoning fallback.
- **Data Persistence**: Google Cloud Firestore & local memory state adapter.
- **Event Ingestion**: Async EventBus with Google Cloud Pub/Sub compatibility.
- **Deployment**: Single-container multi-stage production build on Google Cloud Run.

---

## 📋 13 Specialized Agent Tools

| Tool Name | Purpose |
| :--- | :--- |
| `get_bin_status` | Fetches real-time fill level, battery %, and telemetry health for any bin. |
| `list_critical_bins` | Queries all nodes with fill level ≥80% or sensor failure flags. |
| `get_fleet_status` | Returns vehicle capacity, current coordinates, and crew readiness. |
| `calculate_distance` | Computes Manhattan/Haversine routing distance between fleet and target bins. |
| `optimize_route` | Generates nearest-neighbor optimized waypoints based on urgency and load. |
| `create_collection_task` | Dispatches formal municipal work orders to available crews. |
| `request_human_approval` | Escalates sensitive dispatches to the supervisor approval queue. |
| `verify_collection` | Validates post-servicing sensor telemetry drop (<20% fill). |
| `create_maintenance_ticket`| Dispatches hardware repair crews for faulty or damaged sensors. |
| `recall_surge_memory` | Retrieves historical fill trends and recurring municipal event patterns. |
| `record_surge_memory` | Persists surge event characteristics into the agent memory database. |
| `broadcast_alert` | Publishes city-wide notifications for overflow crises. |
| `get_system_metrics` | Aggregates autonomy ratios, response hours saved, and SLA compliance. |

---

## 💻 Local Development & Quickstart

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-org/wasteops.git
cd wasteops

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for live Gemini API)
cp .env.example .env
# Add your GEMINI_API_KEY if desired (deterministic local fallback works automatically)

# 4. Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```

---

## 👥 Hackathon Team & Acknowledgments

- **Developer**: Abhishek Jha (`jnabhishek01@gmail.com`)
- **Built for**: Google AI Studio / All Things Agentic Hackathon — *The Taskmaster Track*
- **Technology Partners**: Google Cloud Platform, Gemini API, Vite, React
