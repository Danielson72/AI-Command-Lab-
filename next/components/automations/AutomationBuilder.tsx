'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/* ============================================================
   NODE TYPE CONFIG — using ACL design system colors
   ============================================================ */
const NODE_TYPES = {
  trigger:     { icon: '⚡', color: 'var(--acl-gold)',   bg: 'rgba(245,166,35,0.12)',  border: 'var(--acl-gold)',   label: 'Trigger' },
  condition:   { icon: '◆',  color: 'var(--acl-purple)', bg: 'rgba(179,136,255,0.12)', border: 'var(--acl-purple)', label: 'Condition' },
  action:      { icon: '▶',  color: 'var(--acl-green)',  bg: 'rgba(0,230,118,0.12)',   border: 'var(--acl-green)',  label: 'Action' },
  agent:       { icon: '🤖', color: 'var(--acl-cyan)',   bg: 'rgba(0,229,255,0.12)',   border: 'var(--acl-cyan)',   label: 'Agent' },
  webhook_out: { icon: '↗',  color: 'var(--acl-pink)',   bg: 'rgba(255,64,129,0.12)',  border: 'var(--acl-pink)',   label: 'Webhook' },
  delay:       { icon: '⏱',  color: 'var(--acl-orange)', bg: 'rgba(255,145,0,0.12)',   border: 'var(--acl-orange)', label: 'Delay' },
  branch:      { icon: '⑃',  color: 'var(--acl-purple)', bg: 'rgba(179,136,255,0.12)', border: 'var(--acl-purple)', label: 'Branch' },
} as const

type NodeType = keyof typeof NODE_TYPES

interface FlowNode {
  id: string
  type: NodeType
  x: number
  y: number
  label: string
}

interface FlowEdge {
  id: string
  from: string
  to: string
  label?: string
}

interface Template {
  id: string
  name: string
  icon: string
  category: string
  desc: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}

interface RunLog {
  id: number
  status: 'success' | 'failed' | 'running'
  started: string
  duration: string
  trigger: string
}

/* ============================================================
   SUPABASE GRAPH → COMPONENT GRAPH MAPPER
   DB uses source/target + position.x/y + data.label
   Component uses from/to + flat x/y/label
   ============================================================ */
interface DbNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: { label: string; nodeType?: string; config?: Record<string, unknown> }
}

interface DbEdge {
  id: string
  source: string
  target: string
  label?: string
}

interface DbGraph {
  nodes: DbNode[]
  edges: DbEdge[]
}

interface DbTemplate {
  id: string
  name: string
  description: string | null
  category: string
  graph: DbGraph
  icon: string | null
  is_featured: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  leads: '🔥', billing: '💳', crm: '🧠', content: '📅',
}

function mapDbTemplateToTemplate(t: DbTemplate): Template {
  return {
    id: t.id,
    name: t.name,
    icon: t.icon || CATEGORY_ICONS[t.category] || '⚡',
    category: t.category,
    desc: t.description || '',
    nodes: (t.graph.nodes || []).map(n => ({
      id: n.id,
      type: (n.data?.nodeType || n.type || 'action') as NodeType,
      x: n.position?.x ?? 100,
      y: n.position?.y ?? 200,
      label: n.data?.label || n.type || 'Node',
    })),
    edges: (t.graph.edges || []).map(e => ({
      id: e.id,
      from: e.source,
      to: e.target,
      label: e.label,
    })),
  }
}

/* ============================================================
   FLOW CANVAS — custom SVG drag canvas
   ============================================================ */
interface FlowCanvasProps {
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onMove: (id: string, x: number, y: number) => void
}

function FlowCanvas({ nodes, edges, selectedId, onSelect, onMove }: FlowCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<{ id: string; startX: number; startY: number } | null>(null)
  const NODE_W = 180
  const NODE_H = 64

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onSelect(id)
    const node = nodes.find(n => n.id === id)!
    dragging.current = { id, startX: e.clientX - node.x, startY: e.clientY - node.y }
  }

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const { id, startX, startY } = dragging.current
    onMove(id, e.clientX - startX, e.clientY - startY)
  }, [onMove])

  const onMouseUp = () => { dragging.current = null }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, var(--acl-surface) 0%, var(--acl-base) 60%, var(--acl-base) 100%)',
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={() => onSelect(null)}
    >
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.07 }}>
        <defs>
          <pattern id="acl-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--acl-cyan)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#acl-grid)" />
      </svg>

      {/* Edge lines */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--acl-cyan)" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {edges.map(edge => {
          const from = nodes.find(n => n.id === edge.from)
          const to = nodes.find(n => n.id === edge.to)
          if (!from || !to) return null
          const f = { x: from.x + NODE_W, y: from.y + NODE_H / 2 }
          const t = { x: to.x, y: to.y + NODE_H / 2 }
          const dx = Math.abs(t.x - f.x) * 0.5
          const path = `M${f.x},${f.y} C${f.x + dx},${f.y} ${t.x - dx},${t.y} ${t.x},${t.y}`
          return (
            <g key={edge.id}>
              <path
                d={path} fill="none" stroke="var(--acl-cyan)" strokeWidth="2"
                markerEnd="url(#arrow)" filter="url(#glow)" opacity="0.8"
              />
              {edge.label && (
                <text
                  x={(f.x + t.x) / 2} y={(f.y + t.y) / 2 - 8}
                  fill="var(--acl-cyan)" fontSize="11" textAnchor="middle"
                  fontFamily="var(--acl-font-mono)"
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Draggable nodes */}
      {nodes.map(node => {
        const cfg = NODE_TYPES[node.type] ?? NODE_TYPES.action
        const isSelected = selectedId === node.id
        return (
          <div
            key={node.id}
            onMouseDown={(e) => onMouseDown(e, node.id)}
            style={{
              position: 'absolute', left: node.x, top: node.y,
              width: NODE_W, height: NODE_H,
              background: cfg.bg,
              border: `2px solid ${isSelected ? 'var(--acl-text)' : cfg.border}`,
              borderRadius: 'var(--acl-radius)',
              boxShadow: isSelected
                ? `0 0 0 3px ${cfg.bg}, 0 0 24px ${cfg.bg}`
                : `0 0 16px ${cfg.bg}, 0 4px 12px rgba(0,0,0,0.4)`,
              cursor: 'grab', userSelect: 'none',
              display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
              transition: 'box-shadow 0.15s ease',
            }}
          >
            <span style={{ fontSize: 18 }}>{cfg.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 10, color: cfg.color,
                fontFamily: 'var(--acl-font-mono)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
              }}>
                {cfg.label}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--acl-text)', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {node.label}
              </div>
            </div>
            {/* Connection ports */}
            <div style={{
              position: 'absolute', left: -5, top: '50%', transform: 'translateY(-50%)',
              width: 10, height: 10, borderRadius: '50%',
              background: cfg.color, border: '2px solid var(--acl-surface)',
            }} />
            <div style={{
              position: 'absolute', right: -5, top: '50%', transform: 'translateY(-50%)',
              width: 10, height: 10, borderRadius: '50%',
              background: cfg.color, border: '2px solid var(--acl-surface)',
            }} />
          </div>
        )
      })}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>⚡</div>
          <div style={{
            color: 'var(--acl-text-dim)', fontSize: 14,
            fontFamily: 'var(--acl-font-mono)',
          }}>
            Choose a template or add nodes to start
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   MAIN EXPORT — AutomationBuilder
   ============================================================ */
interface Toast {
  message: string
  type: 'success' | 'error'
}

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      padding: '12px 20px',
      background: toast.type === 'success' ? 'rgba(0,230,118,0.15)' : 'rgba(255,64,129,0.15)',
      border: `1px solid ${toast.type === 'success' ? 'var(--acl-green)' : 'var(--acl-pink)'}`,
      borderRadius: 'var(--acl-radius)',
      color: toast.type === 'success' ? 'var(--acl-green)' : 'var(--acl-pink)',
      fontSize: 13, fontFamily: 'var(--acl-font-mono)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      animation: 'fadeInUp 0.3s ease-out',
    }}>
      {toast.type === 'success' ? '✓' : '✗'} {toast.message}
    </div>
  )
}

export default function AutomationBuilder() {
  const [flow, setFlow] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] }>({ nodes: [], edges: [] })
  const [flowName, setFlowName] = useState('Untitled Flow')
  const [flowId, setFlowId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panel, setPanel] = useState<'templates' | 'node' | 'runs'>('templates')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [toast, setToast] = useState<Toast | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [runs] = useState<RunLog[]>([
    { id: 1, status: 'success', started: '2026-03-09 14:32', duration: '1.2s', trigger: 'SOTSVC Lead Form' },
    { id: 2, status: 'success', started: '2026-03-09 11:14', duration: '0.8s', trigger: 'SOTSVC Lead Form' },
    { id: 3, status: 'failed',  started: '2026-03-08 18:05', duration: '3.1s', trigger: 'Manual' },
  ])

  // Load templates from Supabase on mount
  useEffect(() => {
    fetch('/api/automations/templates')
      .then(res => res.json())
      .then(data => {
        if (data.templates) {
          setTemplates(data.templates.map(mapDbTemplateToTemplate))
        }
      })
      .catch(err => {
        console.error('Failed to load templates:', err)
        setToast({ message: 'Failed to load templates', type: 'error' })
      })
      .finally(() => setTemplatesLoading(false))
  }, [])

  const selectedNode = flow.nodes.find(n => n.id === selectedId)

  const loadTemplate = (tmpl: Template) => {
    setFlow({ nodes: [...tmpl.nodes], edges: [...tmpl.edges] })
    setFlowName(tmpl.name)
    setFlowId(null)
    setSelectedId(null)
    setPanel('node')
  }

  const addNode = (type: NodeType) => {
    const id = `node_${Date.now()}`
    setFlow(f => ({
      ...f,
      nodes: [...f.nodes, {
        id, type,
        x: 120 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        label: NODE_TYPES[type].label,
      }],
    }))
    setSelectedId(id)
    setPanel('node')
  }

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setFlow(f => ({
      ...f,
      nodes: f.nodes.map(n => n.id === id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n),
    }))
  }, [])

  const deleteNode = (id: string) => {
    setFlow(f => ({
      nodes: f.nodes.filter(n => n.id !== id),
      edges: f.edges.filter(e => e.from !== id && e.to !== id),
    }))
    setSelectedId(null)
  }

  const updateLabel = (id: string, label: string) => {
    setFlow(f => ({ ...f, nodes: f.nodes.map(n => n.id === id ? { ...n, label } : n) }))
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      const payload = {
        name: flowName,
        description: null,
        graph: { nodes: flow.nodes, edges: flow.edges },
        trigger_type: 'manual',
        trigger_config: {},
        brand_id: 'sotsvc',
      }

      let res: Response
      if (flowId) {
        res = await fetch('/api/automations/flows', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: flowId, ...payload }),
        })
      } else {
        res = await fetch('/api/automations/flows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Save failed')
      }

      if (!flowId && data.flow?.id) {
        setFlowId(data.flow.id)
      }

      setSaveStatus('saved')
      setToast({ message: flowId ? 'Flow updated' : 'Flow created', type: 'success' })
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      setSaveStatus('idle')
      setToast({ message: err instanceof Error ? err.message : 'Save failed', type: 'error' })
    }
  }

  const STATUS_COLOR: Record<string, string> = {
    success: 'var(--acl-green)',
    failed: 'var(--acl-pink)',
    running: 'var(--acl-gold)',
  }

  return (
    <div style={{
      height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column',
      fontFamily: "var(--acl-font-mono, 'JetBrains Mono', monospace)",
      color: 'var(--acl-text)',
    }}>
      {toast && <ToastNotification toast={toast} onDismiss={() => setToast(null)} />}
      {/* ---- TOP BAR ---- */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 20px',
        background: 'var(--acl-surface)',
        borderBottom: '1px solid var(--acl-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--acl-cyan), var(--acl-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            ⚡
          </div>
          <div>
            <div style={{
              fontSize: 11, color: 'var(--acl-cyan)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: 'var(--acl-font-display)',
            }}>
              AI Command Lab
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: 'var(--acl-text)',
              fontFamily: 'var(--acl-font-display)',
            }}>
              Automation Engine
            </div>
          </div>
        </div>

        {/* Flow name input */}
        <div style={{ flex: 1, maxWidth: 300 }}>
          <input
            value={flowName}
            onChange={e => setFlowName(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--acl-surface-hover)',
              border: '1px solid var(--acl-border)',
              borderRadius: 'var(--acl-radius-sm)',
              padding: '6px 12px',
              color: 'var(--acl-text)',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'var(--acl-font-body)',
            }}
          />
        </div>

        {/* Add-node buttons */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {(['trigger', 'condition', 'action', 'agent', 'delay'] as NodeType[]).map(type => {
            const cfg = NODE_TYPES[type]
            return (
              <button
                key={type}
                onClick={() => addNode(type)}
                style={{
                  padding: '5px 10px',
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: 'var(--acl-radius-sm)',
                  color: cfg.color,
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--acl-font-mono)',
                }}
              >
                {cfg.icon} {cfg.label}
              </button>
            )
          })}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            padding: '7px 18px',
            background: saveStatus === 'saved'
              ? 'rgba(0,230,118,0.12)'
              : 'linear-gradient(135deg, var(--acl-cyan), var(--acl-purple))',
            border: saveStatus === 'saved' ? '1px solid var(--acl-green)' : 'none',
            borderRadius: 'var(--acl-radius-sm)',
            color: saveStatus === 'saved' ? 'var(--acl-green)' : 'var(--acl-base)',
            fontSize: 12, cursor: 'pointer', fontWeight: 600, minWidth: 80,
            transition: 'all 0.3s',
            fontFamily: 'var(--acl-font-display)',
          }}
        >
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Save Flow'}
        </button>
      </div>

      {/* ---- MAIN AREA ---- */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT SIDEBAR */}
        <div style={{
          width: 260,
          background: 'var(--acl-surface)',
          borderRight: '1px solid var(--acl-border)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--acl-border)' }}>
            {(['templates', 'node', 'runs'] as const).map(key => (
              <button
                key={key}
                onClick={() => setPanel(key)}
                style={{
                  flex: 1, padding: '10px 0',
                  background: 'none', border: 'none',
                  borderBottom: panel === key ? '2px solid var(--acl-cyan)' : '2px solid transparent',
                  color: panel === key ? 'var(--acl-cyan)' : 'var(--acl-text-dim)',
                  fontSize: 11, cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  fontFamily: 'var(--acl-font-mono)',
                }}
              >
                {key === 'node' ? 'Node' : key === 'runs' ? 'Run Log' : 'Templates'}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {/* TEMPLATES panel */}
            {panel === 'templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  fontSize: 10, color: 'var(--acl-text-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
                  fontFamily: 'var(--acl-font-mono)',
                }}>
                  Starter Templates
                </div>
                {templatesLoading ? (
                  [1, 2, 3].map(i => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px', width: '100%',
                        background: 'var(--acl-surface-hover)',
                        border: '1px solid var(--acl-border)',
                        borderRadius: 'var(--acl-radius)',
                      }}
                    >
                      <div style={{
                        height: 14, width: '60%', borderRadius: 4,
                        background: 'var(--acl-border)', marginBottom: 8,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }} />
                      <div style={{
                        height: 10, width: '80%', borderRadius: 4,
                        background: 'var(--acl-border)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.2s',
                      }} />
                      <div style={{
                        height: 10, width: '40%', borderRadius: 4,
                        background: 'var(--acl-border)', marginTop: 8,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.4s',
                      }} />
                    </div>
                  ))
                ) : templates.length === 0 ? (
                  <div style={{
                    color: 'var(--acl-text-dim)', fontSize: 12,
                    textAlign: 'center', marginTop: 40,
                    fontFamily: 'var(--acl-font-mono)',
                  }}>
                    No templates found
                  </div>
                ) : (
                  templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => loadTemplate(t)}
                      className="glass-card"
                      style={{
                        textAlign: 'left', padding: '10px 12px',
                        cursor: 'pointer', width: '100%',
                        background: 'var(--acl-surface-hover)',
                        border: '1px solid var(--acl-border)',
                        borderRadius: 'var(--acl-radius)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: 'var(--acl-text)',
                          fontFamily: 'var(--acl-font-body)',
                        }}>
                          {t.name}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--acl-text-mid)' }}>{t.desc}</div>
                      <div style={{ marginTop: 6, fontSize: 10, color: 'var(--acl-cyan)' }}>
                        {t.nodes.length} nodes · {t.edges.length} edges
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* NODE panel */}
            {panel === 'node' && (
              <div>
                {selectedNode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                      fontSize: 10, color: 'var(--acl-text-dim)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      fontFamily: 'var(--acl-font-mono)',
                    }}>
                      Selected Node
                    </div>
                    <div style={{
                      padding: 12,
                      background: 'var(--acl-surface-hover)',
                      borderRadius: 'var(--acl-radius)',
                      border: `1px solid ${NODE_TYPES[selectedNode.type]?.border ?? 'var(--acl-border)'}`,
                    }}>
                      <div style={{
                        fontSize: 10,
                        color: NODE_TYPES[selectedNode.type]?.color,
                        marginBottom: 6,
                        fontFamily: 'var(--acl-font-mono)',
                      }}>
                        {NODE_TYPES[selectedNode.type]?.label?.toUpperCase()}
                      </div>
                      <input
                        value={selectedNode.label}
                        onChange={e => updateLabel(selectedNode.id, e.target.value)}
                        className="acl-input"
                        style={{ fontSize: 12 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{
                        flex: 1, padding: '6px 10px',
                        background: 'var(--acl-surface-hover)',
                        borderRadius: 'var(--acl-radius-sm)',
                        fontSize: 11, color: 'var(--acl-text-mid)',
                        fontFamily: 'var(--acl-font-mono)',
                      }}>
                        X: {Math.round(selectedNode.x)}
                      </div>
                      <div style={{
                        flex: 1, padding: '6px 10px',
                        background: 'var(--acl-surface-hover)',
                        borderRadius: 'var(--acl-radius-sm)',
                        fontSize: 11, color: 'var(--acl-text-mid)',
                        fontFamily: 'var(--acl-font-mono)',
                      }}>
                        Y: {Math.round(selectedNode.y)}
                      </div>
                    </div>
                    <textarea
                      placeholder='{"key": "value"}'
                      style={{
                        width: '100%', height: 100,
                        background: 'var(--acl-surface-hover)',
                        border: '1px solid var(--acl-border)',
                        borderRadius: 'var(--acl-radius-sm)',
                        padding: 8,
                        color: 'var(--acl-text-mid)',
                        fontSize: 11, outline: 'none', resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'var(--acl-font-mono)',
                      }}
                    />
                    <button
                      onClick={() => deleteNode(selectedNode.id)}
                      style={{
                        padding: 7,
                        background: 'rgba(255,64,129,0.12)',
                        border: '1px solid var(--acl-pink)',
                        borderRadius: 'var(--acl-radius-sm)',
                        color: 'var(--acl-pink)',
                        fontSize: 11, cursor: 'pointer',
                        fontFamily: 'var(--acl-font-mono)',
                      }}
                    >
                      🗑 Delete Node
                    </button>
                  </div>
                ) : (
                  <div style={{
                    color: 'var(--acl-text-dim)', fontSize: 12,
                    textAlign: 'center', marginTop: 40,
                    fontFamily: 'var(--acl-font-mono)',
                  }}>
                    Click a node on the canvas to edit it
                  </div>
                )}
              </div>
            )}

            {/* RUNS panel */}
            {panel === 'runs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  fontSize: 10, color: 'var(--acl-text-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
                  fontFamily: 'var(--acl-font-mono)',
                }}>
                  Execution History
                </div>
                {runs.map(run => (
                  <div
                    key={run.id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--acl-surface-hover)',
                      border: '1px solid var(--acl-border)',
                      borderRadius: 'var(--acl-radius)',
                    }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 4,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: STATUS_COLOR[run.status],
                        }} />
                        <span style={{
                          fontSize: 11, color: STATUS_COLOR[run.status],
                          textTransform: 'capitalize',
                        }}>
                          {run.status}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--acl-text-dim)' }}>{run.duration}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--acl-text-mid)' }}>{run.trigger}</div>
                    <div style={{ fontSize: 10, color: 'var(--acl-text-dim)', marginTop: 2 }}>{run.started}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CANVAS */}
        <div style={{ flex: 1, position: 'relative' }}>
          <FlowCanvas
            nodes={flow.nodes} edges={flow.edges}
            selectedId={selectedId} onSelect={setSelectedId} onMove={moveNode}
          />
          {/* Status bar */}
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 16, padding: '8px 20px',
            background: 'var(--acl-surface-glass)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--acl-border)',
            borderRadius: 24,
          }}>
            {([['Nodes', flow.nodes.length], ['Edges', flow.edges.length], ['Status', 'Draft']] as [string, string | number][]).map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: 'var(--acl-cyan)',
                  fontFamily: 'var(--acl-font-display)',
                }}>
                  {v}
                </div>
                <div style={{
                  fontSize: 9, color: 'var(--acl-text-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  fontFamily: 'var(--acl-font-mono)',
                }}>
                  {k}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
