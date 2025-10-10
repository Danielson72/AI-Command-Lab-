# 🚀 AI Command Lab - Phase 0 Foundation

**AI Command Lab** is a multi-brand SaaS platform that unifies lead capture, website analysis, AI content generation, workflow automation, and Claude MCP agent control — all from one central dashboard.

---

## ✅ Phase 0 Status: **COMPLETE**

The foundation is fully implemented and ready for development!

- ✅ Next.js 14 app with TypeScript
- ✅ Supabase authentication (login/signup)
- ✅ Protected dashboard routes
- ✅ Database schema applied (7 tables)
- ✅ RLS policies applied (17 policies)
- ✅ CI/CD pipeline configured
- ✅ Multi-tenant architecture

---

## 🚀 Features (Phased Build)

**Phase 0: Foundation** ✅ COMPLETE  
Phase 1: Brands/Plans/Usage • Phase 2: Lead Engine • Phase 3: Website Analysis • Phase 4: AI Content Studio • Phase 5: Workflows • Phase 6: Agent Cockpit • Phase 7: Integrations • Phase 8: Memory & Analytics • Phase 9: Education & White-label

---

## 🛠 Tech Stack

**Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS  
**Backend:** Supabase (PostgreSQL + Auth + RLS)  
**Payments:** Stripe  
**Deployment:** Netlify  
**Automation:** Claude MCP • Zapier/n8n/Make

---

## 📦 Quick Start

### 1. Install Dependencies

```bash
cd next
npm install

```

### 2. Set Up Environment Variables

Create `.env.local` in the `/next` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wxsfnpbmngglkjlytlul.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database

Schema and RLS policies are already applied to Supabase project `wxsfnpbmngglkjlytlul`.

**Tables:** brands, brand_members, plans, subscriptions, usage_counters, feature_flags, audit_logs

---

## 🧪 Testing

```bash
npm run typecheck  # TypeScript validation
npm run lint       # ESLint
npm test           # Vitest
npm run build      # Production build
```

---

## 📁 Project Structure

```
AI-Command-Lab/
├── .github/          # CI/CD and governance
├── db/               # Database schema and policies
├── next/             # Next.js application
│   ├── app/          # App Router pages
│   ├── lib/          # Utilities and clients
│   └── middleware.ts # Route protection
├── server/_archive/  # Old Python backend
└── README.md
```

---

**Built with ❤️ by Manus AI**

