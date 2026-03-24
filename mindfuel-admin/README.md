# MindFuel AI Platform

Personal AI-powered growth and mindfulness platform - Now structured as 3 standalone projects.

## Projects

This repository contains 3 independent, production-ready applications:

### 1. [Backend API](./mindfuel-backend/)
Complete REST API built with Node.js, Express, and TypeScript.

- **Tech:** Node.js, Express, TypeScript, PostgreSQL
- **Features:** 150+ endpoints, AI integration, authentication, e-commerce
- **Port:** 3000

[View Documentation →](./mindfuel-backend/README.md)

### 2. [Admin Panel](./mindfuel-admin/)
Web-based admin dashboard built with React and Vite.

- **Tech:** React 18, TypeScript, Vite, Tailwind CSS
- **Features:** User management, content management, analytics
- **Port:** 5173

[View Documentation →](./mindfuel-admin/README.md)

### 3. [Mobile App](./mindfuel-mobile/)
Native mobile application built with React Native.

- **Tech:** React Native, TypeScript, Redux Toolkit
- **Features:** Content library, AI chat, goal tracking, e-commerce
- **Platforms:** iOS & Android

[View Documentation →](./mindfuel-mobile/README.md)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (Supabase recommended)
- OpenAI API key

### 1. Setup Backend
\`\`\`bash
cd mindfuel-backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
\`\`\`

### 2. Setup Admin (Optional)
\`\`\`bash
cd mindfuel-admin
npm install
cp .env.example .env
npm run dev
\`\`\`

### 3. Setup Mobile
\`\`\`bash
cd mindfuel-mobile
npm install
cp .env.example .env
npm start
\`\`\`

## Architecture

\`\`\`
┌──────────────┐      ┌──────────────┐      ┌─────────────┐
│ Mobile App   │─────>│ Backend API  │─────>│  Supabase   │
└──────────────┘      │              │      │ (Postgres)  │
                      │   Port 3000  │      └─────────────┘
┌──────────────┐      │              │
│ Admin Panel  │─────>│              │
└──────────────┘      └──────────────┘
\`\`\`

All communication happens via REST API at \`http://localhost:3000/api\`

## Documentation

- **[Project Structure](./PROJECT_STRUCTURE.md)** - Complete architecture overview
- **[Restructure Complete](./RESTRUCTURE_COMPLETE.md)** - What was built
- **Backend README** - \`mindfuel-backend/README.md\`
- **Admin README** - \`mindfuel-admin/README.md\`
- **Mobile README** - \`mindfuel-mobile/README.md\`

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Backend** | Node.js, Express, TypeScript, PostgreSQL, OpenAI |
| **Admin** | React 18, Vite, Tailwind CSS, Redux Toolkit |
| **Mobile** | React Native, TypeScript, Redux Toolkit |
| **Database** | Supabase (PostgreSQL + pgvector) |

## Features

- Content & Learning (workbooks, books, reading tracking)
- AI-Powered coach with RAG
- Personal Development (goals, journaling, practices)
- E-commerce (products, cart, payments with Razorpay)
- Content Taxonomy (categories, subcategories, tags)

## License

MIT

---

Built for personal growth and mindfulness
