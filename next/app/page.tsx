import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold mb-2">Welcome to AI Command Lab</h2>
      <p>Central dashboard for multi-brand automation.</p>
      <Link className="underline" href="/lab/agentic-ui">Open Agentic UI Demo →</Link>
    </section>
  );
}
