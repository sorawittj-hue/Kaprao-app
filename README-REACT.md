# Kaprao52 React App

A complete React + TypeScript + Vite migration of the Kaprao52 food ordering application with world-class animations, real-time features, and PWA support.

## 🚀 Features

### Core Features
- **LINE LIFF Integration** - Seamless LINE login and sharing
- **Real-time Orders** - Live order tracking with Supabase Realtime
- **Smart Cart** - Fly-to-cart animations, persistent state
- **Points & Lottery** - Loyalty system with lottery tickets
- **PWA Support** - Installable app with offline capabilities

### UI/UX Excellence
- **Framer Motion** - Smooth page transitions, micro-interactions
- **Responsive Design** - Mobile-first, works on all devices
- **Dark Mode Ready** - Theme switching support
- **Accessibility** - Reduced motion support, ARIA labels

### Admin Dashboard
- **Live Order Management** - Real-time kitchen display
- **Menu Management** - Drag-and-drop, availability toggles
- **Customer Analytics** - Points, order history, tiers
- **Revenue Tracking** - Daily stats and trends

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| State | Zustand |
| Data Fetching | TanStack Query |
| Backend | Supabase |
| Auth | LINE LIFF |
| PWA | Vite PWA Plugin |

## 📁 Project Structure

```
src/
├── app/              # Providers, router, layouts
├── components/       # Shared UI components
├── features/         # Feature-based modules
│   ├── auth/         # LINE LIFF + Supabase auth
│   ├── menu/         # Menu browsing
│   ├── cart/         # Shopping cart
│   ├── checkout/     # Checkout flow
│   ├── orders/       # Order tracking
│   ├── lottery/      # Lottery system
│   ├── points/       # Loyalty points
│   └── admin/        # Admin dashboard
├── hooks/            # Global custom hooks
├── lib/              # Third-party integrations
├── store/            # Zustand stores
├── animations/       # Framer Motion variants
├── styles/           # Tailwind + CSS variables
└── types/            # TypeScript types
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project
- LINE LIFF ID

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Fill in your credentials in .env
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# VITE_LIFF_ID=

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## 📱 PWA Configuration

The app is configured as a Progressive Web App with:
- Service Worker for offline support
- Manifest for "Add to Home Screen"
- Optimized caching strategies

## 🎨 Design System

### Colors
- Primary: `#FF6B00` (Brand Orange)
- Accent: `#22C55E` (Success Green)
- Surface: `#FDFBF7` (Warm White)

### Typography
- Heading: Kanit
- Body: Sarabun

### Animations
- Page transitions: 300ms ease-out
- Micro-interactions: Spring physics
- Reduced motion: Respects user preferences

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_LIFF_ID` | LINE LIFF channel ID |
| `VITE_GA_ID` | Google Analytics ID |
| `VITE_AI_API_URL` | AI recommendations API (optional) |

## 📝 License

MIT License - feel free to use this as a template for your own projects!
