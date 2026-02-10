import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-command-lab.netlify.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI Command Lab',
    template: '%s | AI Command Lab',
  },
  description: 'Stop renting software. Start running your business.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Inline script to prevent flash of wrong theme
  const themeScript = `
    (function() {
      try {
        var t = localStorage.getItem('acl-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', t);
      } catch(e) {}
    })();
  `
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
