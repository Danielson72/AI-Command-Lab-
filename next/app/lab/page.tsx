"use client";
import { useEffect, useState } from "react";

export default function LabPage() {
  const [msg, setMsg] = useState("(loading...)");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    fetch(`${base}/hello`)
      .then((r) => r.json())
      .then((j) => setMsg(j.message ?? JSON.stringify(j)))
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">API Test</h2>
      <div className="mb-2"><strong>Message:</strong> {msg}</div>
      {err && <div className="text-red-600"><strong>Error:</strong> {err}</div>}
      <p className="text-sm opacity-70">
        NEXT_PUBLIC_API_URL = {process.env.NEXT_PUBLIC_API_URL}
      </p>
    </section>
  );
}
