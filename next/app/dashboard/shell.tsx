'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '◆' },
  { label: 'Leads', href: '/dashboard/leads', icon: '◉' },
  { label: 'Brands', href: '/dashboard/brands', icon: '◈' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
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

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('acl-theme') as 'dark' | 'light' | null
    const initialTheme = savedTheme || 'dark'
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

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
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image src="/images/acl-icon.jpg" alt="ACL" width={36} height={36} className="rounded-sm" />
              <h2 style={styles.sidebarLogo}>ACL</h2>
            </div>
            {mounted && (
              <button
                onClick={toggleTheme}
                style={styles.themeToggle}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
            )}
          </div>
          <span style={styles.sidebarTagline}>Command Lab</span>
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
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <span style={styles.userEmail}>
              {user.email?.split('@')[0]}
            </span>
          </div>
          <button onClick={handleSignOut} style={styles.signOut}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main} className="silk-bg">
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
  sidebar: {
    width: '220px',
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-primary)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem 0',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '0 1.25rem 1.25rem',
    borderBottom: '1px solid var(--border-primary)',
  },
  sidebarLogo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    margin: 0,
    fontFamily: 'Outfit, sans-serif',
  },
  sidebarTagline: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  themeToggle: {
    width: '32px',
    height: '24px',
    borderRadius: '12px',
    border: '1px solid var(--border-input)',
    background: 'var(--bg-input)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0.75rem 0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
    fontFamily: 'DM Sans, sans-serif',
  },
  navItemActive: {
    background: 'var(--accent-glow)',
    color: 'var(--text-primary)',
  },
  navIcon: {
    fontSize: '0.75rem',
  },
  sidebarFooter: {
    padding: '1rem 1.25rem 0',
    borderTop: '1px solid var(--border-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  signOut: {
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid var(--border-input)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    background: 'var(--bg-primary)',
  },
  content: {
    padding: '2rem',
    maxWidth: '1200px',
  },
}
