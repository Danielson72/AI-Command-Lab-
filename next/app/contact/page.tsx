"use client";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<null | "idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      message: String(formData.get("message") || ""),
      brand: "SOTSVC",
    };

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${base}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log("Lead response:", json);
      setStatus("ok");
      form.reset();
    } catch (err: any) {
      setStatus("error");
      setError(err?.message ?? "Failed to submit");
    }
  }

  return (
    <section style={{ maxWidth: 560 }}>
      <h2 className="text-2xl font-bold mb-4">Contact / Get a Quote</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" required className="border p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" required className="border p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input name="phone" className="border p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea name="message" rows={4} className="border p-2 w-full" />
        </div>
        <button
          disabled={status === "loading"}
          className="border px-4 py-2 rounded"
          type="submit"
        >
          {status === "loading" ? "Sending..." : "Send"}
        </button>
      </form>

      {status === "ok" && (
        <p className="mt-3 text-green-700">Thanks! We received your request.</p>
      )}
      {status === "error" && (
        <p className="mt-3 text-red-700">Error: {error}</p>
      )}

      <p className="mt-6 text-sm opacity-70">
        NEXT_PUBLIC_API_URL = {process.env.NEXT_PUBLIC_API_URL}
      </p>
    </section>
  );
}
