const moderationSteps = [
  'Primary moderation via NVIDIA API',
  'Automatic failover to OpenRouter free model',
  'Safe degradation to manual review for uncertainty or outage'
];

export default function HomePage() {
  return (
    <main className="shell hero">
      <section className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          LampInTheDark
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.8rem)', margin: '0.5rem 0 1rem' }}>
          Resilient moderation for anonymous healing stories.
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '42rem', color: 'var(--muted)' }}>
          This scaffold upgrades the project to a real Next.js 15 and Supabase-ready structure while
          preserving the moderation fallback design approved for NVIDIA, OpenRouter, and manual review.
        </p>
        <ul style={{ margin: '2rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
          {moderationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
