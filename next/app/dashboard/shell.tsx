'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'

const navItems = [
  {
    label: 'Command Center',
    href: '/dashboard',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  },
  {
    label: 'Lead Capture',
    href: '/dashboard/leads',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    )
  },
  {
    label: 'Website Health',
    href: '/dashboard/brands',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    )
  },
  {
    label: 'Create Content',
    href: '/dashboard/content',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
      </svg>
    )
  },
  {
    label: 'AI Assistants',
    href: '/dashboard/agents',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  },
  {
    label: 'Auto Follow-Up',
    href: '/dashboard/automations',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    )
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.66 5.66l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.66-5.66l4.24-4.24"/>
      </svg>
    )
  },
]

// Mobile bottom nav items (subset of main nav)
const mobileNavItems = [
  navItems[0], // Command Center
  navItems[1], // Lead Capture
  navItems[4], // AI Assistants
  navItems[3], // Create Content
  navItems[7], // Settings
]

export function DashboardShell({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('acl-theme') as 'dark' | 'light' | null
    const initialTheme = savedTheme || 'dark'
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('acl-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <style jsx global>{`
        @media (max-width: 639px) {
          .mobile-hamburger { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .dashboard-sidebar {
            position: fixed !important;
            left: -100% !important;
            top: 0 !important;
            height: 100vh !important;
            z-index: 100 !important;
            width: 280px !important;
          }
          .dashboard-sidebar-open { left: 0 !important; }
          .mobile-close-btn { display: flex !important; }
          .kingdom-silk-bg::before { opacity: 0.35 !important; }
          .kingdom-silk-bg::after { opacity: 0.6 !important; }
          .dashboard-content { padding: 1rem 1rem 6rem !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .dashboard-sidebar { width: 180px !important; }
          .dashboard-content { padding: 1.25rem !important; }
        }
        @media (min-width: 1024px) {
          .dashboard-content { padding: 1.5rem 1.75rem !important; }
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={styles.hamburger}
          className="mobile-hamburger"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            style={styles.mobileOverlay}
            className="mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          style={styles.sidebar}
          className={`dashboard-sidebar ${mobileMenuOpen ? 'dashboard-sidebar-open' : ''}`}
        >
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={styles.closeButton}
            className="mobile-close-btn"
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div style={styles.sidebarHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Image
                src="/images/acl-logo.png"
                alt="ACL"
                width={36}
                height={36}
                style={{ borderRadius: '4px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={styles.sidebarLogo}>ACL</span>
                <span style={styles.sidebarTagline}>AI Command Lab</span>
              </div>
            </div>
          </div>

          <nav style={styles.nav}>
            {navItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                  }}
                >
                  <span style={styles.navIcon}>{item.icon()}</span>
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Phase Progress Ring */}
          <div style={styles.phaseProgress}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(245,166,35,0.1)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--acl-gold)"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 40 * 0.26} ${2 * Math.PI * 40}`}
                strokeLinecap="round"
              />
            </svg>
            <div style={styles.phaseLabel}>
              <span style={styles.phasePercent}>26%</span>
              <span style={styles.phaseText}>PHASE 2/10</span>
            </div>
          </div>

          <div style={styles.sidebarFooter}>
            <div style={styles.userInfo}>
              <span style={styles.userEmail}>
                {user.email?.split('@')[0]}
              </span>
            </div>
            {mounted && (
              <button
                onClick={toggleTheme}
                style={styles.themeToggle}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? '☀ Light' : '☾ Dark'}
              </button>
            )}
            <button onClick={handleSignOut} style={styles.signOut}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={styles.main}>
          <div style={styles.content} className="dashboard-content">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav">
          {mobileNavItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon()}
                <span>{item.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    color: 'var(--acl-text)',
    position: 'relative',
  },
  hamburger: {
    display: 'none',
    position: 'fixed',
    top: '1rem',
    left: '1rem',
    zIndex: 110,
    width: '44px',
    height: '44px',
    background: 'var(--acl-surface-glass)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--acl-border)',
    borderRadius: 'var(--acl-radius-sm)',
    color: 'var(--acl-text)',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  mobileOverlay: {
    display: 'none',
    position: 'fixed',
    inset: 0,
    background: 'rgba(8,12,20,0.8)',
    backdropFilter: 'blur(4px)',
    zIndex: 90,
  },
  sidebar: {
    width: '210px',
    background: 'rgba(8,12,20,0.95)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid var(--acl-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem 0',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    transition: 'left 0.3s ease',
  },
  closeButton: {
    display: 'none',
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '32px',
    height: '32px',
    background: 'transparent',
    border: 'none',
    color: 'var(--acl-text-mid)',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarHeader: {
    padding: '0 1.25rem 1.25rem',
    borderBottom: '1px solid var(--acl-border)',
  },
  sidebarLogo: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--acl-cyan)',
    margin: 0,
    fontFamily: 'Orbitron, sans-serif',
    letterSpacing: '0.05em',
  },
  sidebarTagline: {
    fontSize: '0.65rem',
    color: 'var(--acl-text-dim)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontFamily: 'JetBrains Mono, monospace',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '1rem 0.75rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--acl-radius-sm)',
    border: 'none',
    background: 'transparent',
    color: 'var(--acl-text-mid)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
    fontFamily: 'Sora, sans-serif',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  navItemActive: {
    background: 'rgba(0,229,255,0.08)',
    color: 'var(--acl-cyan)',
    borderLeft: '2px solid var(--acl-cyan)',
    paddingLeft: 'calc(0.85rem - 2px)',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseProgress: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative',
  },
  phaseLabel: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  phasePercent: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--acl-gold)',
    fontFamily: 'Orbitron, sans-serif',
  },
  phaseText: {
    fontSize: '0.6rem',
    color: 'var(--acl-text-dim)',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.08em',
  },
  sidebarFooter: {
    padding: '1rem 1.25rem 0',
    borderTop: '1px solid var(--acl-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: 'var(--acl-text-mid)',
    fontFamily: 'JetBrains Mono, monospace',
  },
  themeToggle: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--acl-radius-sm)',
    border: '1px solid var(--acl-border)',
    background: 'transparent',
    color: 'var(--acl-text-mid)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
    fontFamily: 'Sora, sans-serif',
  },
  signOut: {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--acl-radius-sm)',
    border: '1px solid var(--acl-border)',
    background: 'transparent',
    color: 'var(--acl-text-mid)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'Sora, sans-serif',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    minWidth: 0,
  },
  content: {
    padding: '1.5rem 1rem 6rem',
    maxWidth: '1400px',
  },
}
