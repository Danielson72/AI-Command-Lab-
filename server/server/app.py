from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import run_agent

app = FastAPI()

origins = ["http://localhost:3000", "https://*.netlify.app"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

class AgentReq(BaseModel):
    prompt: str

@app.post("/agent/run")
def agent_run(req: AgentReq):
    return run_agent(req.prompt)
