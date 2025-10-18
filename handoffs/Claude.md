# 🧠 Handoff to Claude: AI Logic & Front-End

**To:** Senior AI Systems Architect & Front-End Developer
**From:** CTO
**Date:** October 18, 2025
**Subject:** Phase 1 & 2 Handoff: Kingdom Closer + Kingdom Ops Agent AI & UI Layer

---

This document outlines the mission and technical specifications for implementing the AI infrastructure and user-facing components for our new systems. The backend foundation is now complete.

## 🚀 Mission

Your mission is to implement the AI infrastructure and logic layer for both the **Kingdom Closer Engine** and the **Kingdom Ops Agent**. You will use the **Claude Code + Agent SDK** to orchestrate reasoning, tool calling, and natural language generation, and build the necessary front-end components for the AI Command Lab dashboard.

## 🧱 Core Responsibilities

| Module                  | Task                                                                                                     | Output                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Kingdom Closer Engine** | Build front-end components (CQIForm, TrialDashboard, ServiceCatalog) and wire them to Supabase + Claude API. | React components under `/modules/kingdom-closer/`   |
| **Kingdom Ops Agent**     | Implement Claude Agent SDK logic to plan and execute backend tasks based on the `ops_tasks` table.       | Node.js agent under `/agents/kingdom-ops/`        |
| **Mind Engine Integration** | Parse empathy, persuasion, and emotional trigger JSONs from the `knowledge/` directory.                  | An NLP pipeline for adaptive tone and empathetic responses. |

## ⚙️ Claude Agent Instructions

### A. Kingdom Closer Logic

- **Prompts:** Use prompts from a `prompts/` directory (e.g., `cqiGenerator.md`, `serviceRecommendation.md`, `postTrialCloser.md`).
- **Data Source:** Parse user answers from the `cqi_responses` table in Supabase.
- **Generation:** Generate the following and store the results in the `trials` table:
    - Recommended service
    - Emotional pitch angle
    - Script or email copy

### B. Kingdom Ops Agent

The Agent SDK should be configured to:

1.  **Listen** for new tasks from the `ops_tasks` table (using Supabase Realtime).
2.  **Execute** infrastructure actions via DigitalOcean and Terminus APIs.
3.  **Log** all updates and results to the `infra_logs` table.
4.  **Summarize** key results to the Command Lab dashboard for visualization.

### C. Empathy Engine Hook

Every client interaction (CQI chat, email, or SMS) should trigger a call to a new API endpoint to get a real-time empathetic response:

```http
POST /api/ai/emotion
Content-Type: application/json

{
  "context": "The user's message or interaction context...",
  "detected_emotion": "frustration"
}
```

This endpoint should return a structured empathy response from the `knowledge/` JSON files.

## 💻 Claude Code Front-End Tasks

1.  **Build the Dashboard Module:**
    - **Path:** `/modules/analytics/KingdomOpsDashboard.tsx`
    - **Display:**
        - Active CQIs
        - Ongoing trials
        - Ops Agent tasks (in-progress, completed, failed)
        - Key conversion metrics (e.g., trial to paid conversion rate)

2.  **Add React Hooks:**
    - `useEmpathyTone()`: Fetches real-time empathetic responses.
    - `useTrialSummary()`: Gathers and summarizes data for a specific trial.
    - `useOpsStatus()`: Tracks the status of ongoing ops tasks.

3.  **Supabase Integration:** Ensure all components connect through the Supabase client using RLS-safe queries, leveraging the `chatbot` role for user-facing data.

## 🛡️ Security & Governance

- **Destructive Operations:** No agent can perform destructive ops (e.g., deleting a server) without the `approved: true` flag being set in the `ops_tasks` table. This is a critical safety measure.
- **Audit Trail:** All AI-driven actions and decisions must be logged to the `infra_logs` table for complete transparency and review.

## 🧭 Final Integration Flow

1.  A user interacts with a **CQI form** on the front-end → data is stored in Supabase.
2.  The `on_cqi_submit` function triggers the **Claude Agent** to generate a service recommendation → stores it in the `trials` table.
3.  A trial starts → the **Ops Agent** monitors it, runs automated checks, and reports back to the `ops_tasks` table.
4.  The **Mind Engine** is consulted at each interaction point to record emotional tone and adapt responses.
5.  The **Command Lab dashboard** shows a complete, real-time picture of the entire customer and operational lifecycle.

---

**Closing Statement:** “We’re not building software — we’re building discernment in code.” Every system here must think, feel, and serve as if it carries Daniel’s character: humble, wise, and focused on value through empathy.

