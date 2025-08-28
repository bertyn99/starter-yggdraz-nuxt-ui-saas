# 🚀 Nuxt UI SaaS Starter Template

A production-ready, feature-rich SaaS starter template built with **Nuxt 4**, **Nuxt UI Pro**, and modern web technologies. This template provides everything you need to build and deploy a professional SaaS application.

![Nuxt](https://img.shields.io/badge/Nuxt-4.0.3-00DC82?style=for-the-badge&logo=nuxt.js)
![Vue](https://img.shields.io/badge/Vue-3.4+-4FC08D?style=for-the-badge&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎨 **UI & Design System**
- **Nuxt UI Pro** - Professional component library with 100+ components
- **Tailwind CSS** - Utility-first CSS framework
- **Custom color scheme** - Lime primary with neutral gray
- **Responsive design** - Mobile-first approach
- **Dark/Light mode support** - Built-in theme switching
- **Iconify integration** - 100,000+ icons from Lucide and Simple Icons

### 🔐 **Authentication & Security**
- [x] **nuxt-auth-utils** - Modern authentication system
- [x] **Multi-provider support** - Credentials, Google, Facebook, Apple, Twitter, GitHub
- [x] **Session management** - Secure token-based sessions
- [ ] **Role-based access control** - User, Admin, Staff roles
- [ ] **Security headers** - CSRF protection, secure cookies
- [x] **Password hashing** - Argon2 for secure password storage
- [ ] **Authorization** - Role-based access control
- [ ] **Permissions** - Define permissions for each resource/action
- [ ] **Ability** - Define abilities for each resource/action

### 🗄️ **Database & ORM**
- **Drizzle ORM** - Type-safe database toolkit
- **SQLite support** - Built-in with better-sqlite3
- **PostgreSQL ready** - Easy migration path
- **Database migrations** - Version-controlled schema changes
- **Type-safe queries** - Full TypeScript support
- **Database studio** - Visual database management

### 📝 **Content Management**
- [x] **Nuxt Content** - File-based CMS with Markdown support
- [x] **Structured content** - YAML-based content schemas
- [x] **SEO optimization** - Meta tags, Open Graph, structured data
- [x] **Blog system** - Complete blogging platform
- [x] **Dynamic routing** - Auto-generated pages from content
- [x] **Changelog** - Changelog file
- [ ] **Documentation** - Documentation for the project
- [x] **FAQ** - FAQ for the project
- [ ] **Contact** - Contact page for the project
- [x] **Privacy Policy** - Privacy policy for the project
- [x] **Terms of Service** - Terms of service for the project

### 🚀 **Performance & SEO**
- [x] **Nuxt Image** - Optimized image handling
- [x] **Static generation** - Pre-rendered pages for speed
- [x] **SEO module** - Advanced search engine optimization
- [ ] **Og-image** - Open Graph image generation
- [ ] **Sitemap** - Sitemap generation
- [ ] **Robots.txt** - Robots.txt generation
- [ ] **RSS Feed** - RSS feed generation
- [ ] **JSON Feed** - JSON feed generation
- [ ] **Meta management** - Dynamic meta tags
- [x] **Performance monitoring** - Built-in devtools

### 🛠️ **Development Experience**
- [x] **TypeScript** - Full type safety
- [x] **ESLint** - Code quality and consistency
- [x] **Hot reload** - Instant development feedback
- [x] **VS Code support** - Optimized development environment
- [x] **Git integration** - Version control ready

## 🔄 **Planned Features**

### **🔐 Enhanced Authentication & Security**
- [ ] **Social Authentication** - Google OAuth and GitHub OAuth integration
- [ ] **Forgot Password Flow** - Secure password reset with email verification
- [ ] **Email Verification** - Account verification on signup
- [ ] **Password Change Notifications** - Email alerts when passwords are updated

### **📧 Email Infrastructure**
- [ ] **Email Service Layer** - Centralized email handling with service utilities
- [ ] **Welcome Emails** - Automated onboarding emails for new users
- [ ] **Transactional Emails** - Password reset, verification, and security notifications
- [ ] **Email Templates** - Professional, branded email designs

### **🔄 User Experience Improvements**
- [ ] **Account Recovery** - Multiple recovery options and security measures
- [ ] **Profile Management** - Enhanced user profile customization
- [ ] **Session Management** - Better control over active sessions
- [ ] **Security Dashboard** - User security settings and activity monitoring

### **💳 Payment & Subscription Management**
- [ ] **Stripe Integration** - Secure payment processing with Stripe
- [ ] **One-time Payments** - Handle single purchases and upgrades
- [ ] **Subscription Management** - Recurring billing with multiple plan tiers
- [ ] **Payment History** - User dashboard for transaction tracking
- [ ] **Webhook Handling** - Real-time payment event processing
- [ ] **Invoice Generation** - Automated billing and receipt creation

## 📦 **Libraries & Dependencies**

### **Core Framework**
- **Nuxt 4** - Full-stack Vue.js framework
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Typed JavaScript

### **UI Components**
- **@nuxt/ui-pro** - Professional UI component library
- **@iconify-json/lucide** - Beautiful icon set
- **@iconify-json/simple-icons** - Brand and technology icons

### **Authentication & Security**
- **nuxt-auth-utils** - Modern authentication utilities
- **@node-rs/argon2** - Fast password hashing
- **nuxt-authorization** - Authorization module
- **nuxt-security** - Security headers and protection
- **zod** - Schema validation

### **Database & ORM**
- **drizzle-orm** - Type-safe database toolkit
- **drizzle-kit** - Database migration tools
- **better-sqlite3** - High-performance SQLite

### **Content & SEO**
- **@nuxt/content** - File-based CMS
- **@nuxt/image** - Image optimization
- **@nuxtjs/seo** - SEO management

### **Development Tools**
- **@nuxt/eslint** - ESLint integration
- **@nuxt/devtools** - Development utilities

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended), npm, yarn, or bun

### **Installation**

```bash
# Clone the repository
git clone <your-repo-url>
cd starter-yggdraz-nuxt-ui-saas

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Your application will be available at `http://localhost:3000`

## 🗄️ **Database Setup**

This template supports multiple database configurations. Choose the one that fits your needs:

### **Option 1: SQLite (Default - Development)**

The template comes pre-configured with SQLite for development:

```bash
# Generate database schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open database studio (optional)
pnpm db:studio
```

**Configuration**: `drizzle.config.ts` is already set up for SQLite.

### **Option 2: PostgreSQL (Production)**

For production use, switch to PostgreSQL:

1. **Install PostgreSQL dependencies:**
```bash
pnpm add postgres @types/pg
pnpm remove better-sqlite3 @types/better-sqlite3
```

2. **Update `drizzle.config.ts`:**
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./server/db/schemas/*.ts'],
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  }
})
```

3. **Update `nuxt.config.ts`:**
```typescript
export default defineNuxtConfig({
  // ... other config
  content: {
    database: {}
  }
})
```

4. **Set environment variables:**
```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=nuxt_saas
```

### **Option 3: NuxtHub Integration**

To integrate with NuxtHub for managed database services:

1. **Install NuxtHub:**
```bash
pnpm add @nuxthub/core
```

2. **Update `nuxt.config.ts`:**
```typescript
export default defineNuxtConfig({
  modules: [
    // ... other modules
    '@nuxthub/core'
  ],
  hub: {
    database: {
      type: 'postgresql',
      // NuxtHub will handle credentials automatically
    }
  }
})
```

3. **Configure NuxtHub in your project settings**

## 🔧 **Customization**

### **Theme & Colors**

Update `app.config.ts` to customize your theme:

```typescript
export default defineAppConfig({
  ui: {
    primary: 'blue', // Change primary color
    gray: 'slate',   // Change gray scale
   
  }
})
```

### **Content Structure**

Modify `content.config.ts` to customize your content schemas:

```typescript
// Add new content types
export const collections = {
  // ... existing collections
  products: defineCollection({
    source: '5.products/**/*',
    type: 'page',
    schema: z.object({
      name: z.string(),
      price: z.number(),
      description: z.string()
    })
  })
}
```

### **Authentication Providers**

Add new OAuth providers in `server/api/auth/provider/`:

```typescript
// server/api/auth/provider/github.get.ts
export default defineEventHandler(async (event) => {
  // Implement GitHub OAuth
})
```

## 📁 **Project Structure**

```
├── app/                    # Application code
│   ├── components/        # Vue components
│   ├── layouts/           # Layout components
│   ├── pages/             # Route pages
│   ├── middleware/        # Route middleware
│   └── composables/       # Composable functions
├── content/               # Content files (Markdown, YAML)
├── server/                # Server-side code
│   ├── api/              # API endpoints
│   ├── db/               # Database schemas & migrations
│   └── utils/            # Server utilities
├── shared/                # Shared types & utilities
├── public/                # Static assets
└── .nuxt/                 # Build output
```

## 🚀 **Deployment**

### **Build for Production**

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

### **Environment Variables**

Set these environment variables for production:

```bash
# Database
DB_HOST=your_db_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Authentication
AUTH_SECRET=your_auth_secret
AUTH_ORIGIN=https://yourdomain.com

# OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📚 **Available Scripts**

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build

# Database
pnpm db:generate  # Generate database schema
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open database studio

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

- **Documentation**: [Nuxt Docs](https://nuxt.com/docs)
- **UI Components**: [Nuxt UI](https://ui.nuxt.com)
- **Issues**: Create an issue in the repository

---

**Built with ❤️ using Nuxt 4 and modern web technologies**
