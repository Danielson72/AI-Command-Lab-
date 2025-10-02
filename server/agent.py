from pydantic import BaseModel

class AgentRequest(BaseModel):
    prompt: str

def run_agent(prompt: str):
    # Stubbed logic for now. Later: call Claude + MCP tools.
    plan = {
        "steps": [
            "Understand the request and target brand",
            "Generate plan & tasks",
            "Execute tools (CRM, Netlify, Supabase, Stripe) as needed",
        ]
    }
    reply = f"I received: “{prompt}”. I created a 3-step plan (see below)."
    return {"reply": reply, "plan": plan}
