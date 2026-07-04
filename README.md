# ⚖️ Micham (മീച്ചം)

> **Micham** (pronounced *Mee-cham*, meaning **balance** or **savings** in Malayalam) is a modern, zero-bloat bookkeeping and invoicing SaaS designed specifically for freelancers, independent contractors, and digital creators.

---

## 📌 The Problem Micham Solves

Freelancing is liberating, but managing the business side is a massive headache. Tracking expenses across projects, maintaining client profiles, drafting professional billing invoices, and preparing reports for tax season usually requires juggling multiple disjointed spreadsheets or expensive, bloated corporate accounting software.

**Micham** solves this by providing a unified, premium financial cockpit:
- **No Bloat:** Built exclusively around the freelancer workflow (no double-entry ledger jargon).
- **Automation first:** Uses **Google Gemini** (via **Vercel AI SDK**) to automatically categorize business expenses and polish rough project notes into professional client-facing invoice items.
- **Financial Integrity:** Keeps income and billing invoices connected. Marking an invoice as paid automatically creates a corresponding income record, giving you an accurate, real-time snapshot of your actual net savings.

---

## 🚀 Key Features

### 📊 Financial Dashboard & Analytics
- Track monthly income, expenses, and net cashflow.
- Visualize performance over time using interactive bar charts and expense distribution summaries.
- Keep track of unpaid invoice balances and client lists at a glance.

### 📝 Smart Expense Logging
- Log income inflows and expense outflows.
- **AI Categorization:** Describe your expense (e.g. *"paid for github copilot annual subscription"*), and Micham automatically suggests the correct category (`software`, `travel`, `equipment`, `marketing`, `other`).
- Support for Cloudinary-powered receipt attachments.

### 💼 Client & Project CRM
- Store company names, client emails, billing addresses, and internal notes.
- Associate multiple client projects to monitor billing metrics per project.

### 🧾 Professional Invoice Builder
- Draft and preview clean, PDF-ready invoice statements.
- **AI Copywriting:** Rewrite rough notes (e.g. *"wrote code for auth dashboard page"*) into a polished line-item description (e.g. *"Implementation of OAuth & Auth.js dashboard panels"*) with a single click.
- Generate shared public links for clients to view, print, or download invoices directly.

### 🛡️ Authentication & Route Protection
- Secure user sessions powered by **Auth.js v5 (NextAuth)**.
- Automatic routing guards: unauthenticated visitors are kept on the SEO-optimized landing page, while logged-in users are routed straight to `/dashboard`.

---

## 🧰 Technology Stack

- **Frontend Core:** [Next.js 16](https://nextjs.org) (App Router, Server Components by default, Route Groups for layout persistence).
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com) (theme-token Notion palette design system) + [shadcn/ui](https://ui.shadcn.com) (accessible primitives) + [Lucide React](https://lucide.dev) (modern icons).
- **Database Layer:** [MongoDB Atlas](https://www.mongodb.com/atlas/database) + [Mongoose](https://mongoosejs.com) (schemas, global connection caching, and financial soft deletes).
- **AI Integration:** [Vercel AI SDK Core](https://sdk.vercel.ai/docs) + [@ai-sdk/google](https://sdk.vercel.ai/providers/ai-sdk-providers/google) (`gemini-1.5-flash` model).
- **Authentication:** [Auth.js v5](https://authjs.dev) (Credentials provider).
- **Validation:** [Zod](https://zod.dev) (schema validations on Server Actions).
- **File Uploads:** [Cloudinary API](https://cloudinary.com).

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) and a running [MongoDB](https://www.mongodb.com) instance.

### 1️⃣ Clone & Install
```bash
git clone <repository-url>
cd expense-tracker
npm install
```

### 2️⃣ Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# MongoDB Connection URL
DATA_BASE_URL=mongodb://127.0.0.1:27017/expense-tracker

# Auth.js Secret (Generate using: openssl rand -hex 32)
AUTH_SECRET=your_auth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Credentials (for receipt image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3️⃣ Seed the Database
To quickly test the application, seed the database with a pre-configured demo account and historical financial data:
```bash
npm run seed
```
- **Demo Username:** `demo@freelancer.com`
- **Demo Password:** `password123`

### 4️⃣ Start the Server
Run the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂️ Project Architecture & Design Decisions

### Feature-Driven Folder Structure
The codebase lives at the root and follows a modern feature-by-folder modular convention:
```text
app/
 ├── (dashboard)/        # Persistent layout containing sidebar, header, and auth guards
 │    ├── dashboard/     # Main analytics view
 │    ├── clients/       # CRM pages
 │    ├── invoices/      # Invoice editor and sharing
 │    ├── settings/      # Display & currency settings
 │    └── transactions/  # Income/expense log sheets
 ├── login/              # Guest auth login
 ├── register/           # Guest auth register
 └── page.tsx            # Public SEO landing page
features/                # Scoped logic, components, actions, schemas per domain
 ├── auth/
 ├── clients/
 ├── dashboard/
 ├── expenses/
 ├── income/
 └── invoices/
components/              # Shared UI components (app-layout, ui buttons, tables)
services/                # Shared helper services (gemini.ts, cloudinary.ts)
models/                  # Mongoose MongoDB models
lib/                     # Utility functions (db connection caching, utility functions)
```

### Key Architectural Choices
1. **Server Components by Default:** Layouts and pages fetch database data directly on the server to maximize speed. Interactivity is pushed to leaf nodes (like forms and interactive charts) using `"use client"`.
2. **Server Actions for Mutations:** All writes are handled via Secure Next.js Server Actions with strict Zod validation on entry before touching the Mongoose layer.
3. **Connection Caching:** MongoDB database connections are cached globally (`lib/db.ts`) to avoid socket limits under high-concurrency serverless deployments.
4. **Soft Deletes:** Financial records use an `isDeleted: Boolean` + `deletedAt: Date` soft delete policy to protect audit trails.
