'use client';

import { useState } from 'react';
import { fetchAPI } from '../../../lib/api';

type Msg = { role: 'user' | 'agent'; text: string };

export default function AgenticUIDemo() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'agent', text: 'Hi! I can plan and run tasks across your brands. What do you need?' }
  ]);

  async function runAgent() {
    if (!input.trim() || busy) return;
    const userMsg: Msg = { role: 'user', text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetchAPI('/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.text }),
      });
      const { reply, plan } = res;
      setMessages((m) => [
        ...m,
        { role: 'agent', text: reply },
        { role: 'agent', text: `Plan:\n- ${plan.steps.join('\n- ')}` },
      ]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'agent', text: `Error: ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Agentic UI Demo</h2>
      <p className="text-sm text-gray-600">This page will later connect to Claude MCP tools. For now it hits our FastAPI /agent/run.</p>

      <div className="border rounded p-4 space-y-2 bg-white">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block rounded px-3 py-2 ${m.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <strong>{m.role === 'user' ? 'You' : 'Agent'}: </strong>{m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="e.g., Draft a 3-step plan to post tomorrow’s SOTSVC graphic at 7am"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' ? runAgent() : null}
        />
        <button
          onClick={runAgent}
          disabled={busy}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {busy ? 'Thinking…' : 'Run'}
        </button>
      </div>
    </section>
  );
}
