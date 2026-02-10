import Script from 'next/script'

export default function EmbedTestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '3rem 1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          color: '#F1F5F9',
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
        }}>
          Lead Form Embed Test
        </h1>

        <p style={{
          color: '#94A3B8',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          This page demonstrates the embeddable lead capture form widget. The form below is rendered using Shadow DOM,
          ensuring styles are isolated from the host page.
        </p>

        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ color: '#F1F5F9', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Embed Code
          </h2>
          <pre style={{
            background: '#0B1120',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '8px',
            padding: '1rem',
            overflow: 'auto',
            fontSize: '0.85rem',
            color: '#38BDF8',
            lineHeight: 1.5,
          }}>
{`<div id="acl-lead-form" data-brand="sotsvc"></div>
<script src="https://ai-command-lab.netlify.app/embed/lead-form.js"></script>`}
          </pre>
          <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Change <code style={{ color: '#38BDF8' }}>data-brand</code> to match your brand slug:
            sotsvc, bossofclean, trustedcleaningexpert, etc.
          </p>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(100, 116, 139, 0.15)',
          borderRadius: '16px',
          padding: '2rem',
        }}>
          <h2 style={{
            color: '#94A3B8',
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1.5rem',
          }}>
            Live Preview
          </h2>

          {/* The embedded form */}
          <div id="acl-lead-form" data-brand="sotsvc"></div>
          <Script src="/embed/lead-form.js" strategy="lazyOnload" />
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          borderRadius: '8px',
        }}>
          <p style={{ color: '#34D399', fontSize: '0.85rem', margin: 0 }}>
            <strong>Note:</strong> Submitted leads will appear in the AI Command Lab dashboard under Leads.
          </p>
        </div>
      </div>
    </div>
  )
}
