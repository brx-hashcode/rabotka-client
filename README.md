# Rabotka

A modern landing page for **Rabotka** — a WhatsApp-based job platform connecting informal workers and employers in African cities, starting with Brazzaville, Congo.

## About Rabotka

Rabotka revolutionizes job matching by connecting informal workers and employers through a simple WhatsApp assistant. Our mission: **Find work. Find help. Directly on WhatsApp** — no app download, no complexity, just simple connections.

### Key Features

- **WhatsApp-Based** — Works directly on WhatsApp, no app to download
- **Free Platform** — No fees for workers or employers
- **Verified Profiles** — Trust and security built into every connection
- **Direct Contact** — Connect directly via WhatsApp chat or phone call
- **Accessible** — Works on any smartphone with WhatsApp, no internet required for basic use
- **Local Focus** — Designed for African markets, starting with Brazzaville

### Vision

Built for informal workers and employers in African cities. Simple, accessible, and trusted — connecting opportunities through the platform everyone already uses.

## Tech Stack

| Category | Technology |
|----------|------------|
| Build Tool | Vite 5 |
| Framework | React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + tw-animate-css |
| UI Components | shadcn/ui (Radix UI primitives) |
| Animations | Framer Motion |
| Routing | React Router DOM 6 |
| State/Data | TanStack React Query |
| Testing | Vitest + Testing Library |

## Project Structure

```
src/
├── app/           # App entry, providers, routes
├── assets/        # Images and static assets
├── components/    # Shared UI components (shadcn/ui)
│   ├── common/    # Common reusable components
│   └── ui/        # shadcn/ui components
├── content/       # Content data (hero, features, etc.)
│   └── landing/   # Landing page content
├── features/      # Feature-based modules
│   └── landing/   # Landing page feature components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
├── styles/        # Global CSS
├── test/          # Test setup and files
└── types/         # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/bruxx-6243/rabotka-landing.git
cd rabotka-landing

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm build:dev` | Build in development mode |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |

## Development Notes

### Content Management

Landing page content is centralized in `src/content/landing/` for easy updates:

- `hero.ts` — Hero section content
- `reality.ts` — Reality section content
- `why-whatsapp.ts` — Why WhatsApp section
- `what-is-rabotka.ts` — What is Rabotka section
- `how-it-works.ts` — How it works steps
- `direct-contact.ts` — Direct contact section
- `trust.ts` — Trust and security section
- `accessibility.ts` — Accessibility section
- `impact.ts` — Impact section
- `vision.ts` — Vision section
- `cta.ts` — Call-to-action section
- `navigation.ts` — Navigation links
- `footer.ts` — Footer content

### Component Organization

Components follow a feature-based architecture:

- **`src/components/ui/`** — shadcn/ui base components
- **`src/components/common/`** — Shared custom components
- **`src/features/landing/components/`** — Landing page specific sections

### Design System

- **Fonts**: Poppins (headings) and Inter (body text)
- **Colors**: WhatsApp-inspired green palette with warm African accents
- **Animations**: Framer Motion for scroll-triggered animations
- **Responsive**: Mobile-first design approach

## License

Private project.
