# Technical Architecture

## Tech Stack

### Frontend
- **Framework**: Next.js 16.0.10 (React 19.2.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useRouter)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Tailwind CSS Animate

### Build Tools
- **Package Manager**: pnpm
- **Bundler**: Next.js built-in (Webpack/Turbopack)
- **PostCSS**: For Tailwind processing

### Deployment
- **Analytics**: Vercel Analytics
- **Hosting**: Vercel (assumed, based on Next.js)

---

## Project Structure

```
futuristic-rpg-dashboard/
├── app/                    # Next.js app router pages
│   ├── page.tsx            # Main dashboard/home
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   ├── contracts/          # Contracts page
│   ├── skirmish/           # Combat page
│   ├── crew/               # Crew management
│   ├── outposts/           # Outpost management
│   ├── loadout/            # Equipment management
│   ├── medbay/             # Health/recovery
│   ├── comms/              # Activity feed
│   ├── overseer/           # Daily missions & events
│   └── settings/           # Settings page
├── components/             # React components
│   ├── ui/                 # Reusable UI primitives (shadcn/ui)
│   └── [feature].tsx       # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── public/                 # Static assets
├── styles/                 # Additional stylesheets
└── docs/                   # Documentation
```

---

## Data Models

### Player Data Structure

```typescript
interface PlayerData {
  // Resources
  credits: number
  alloy: number
  level: number
  xpCurrent: number
  xpMax: number
  
  // Energy Systems
  charge: number
  chargeMax: number
  adrenal: number
  adrenalMax: number
  
  // Crew
  crewSize: number
  crewMax: number
  
  // Identity (optional, shown on main page)
  handle?: string
  rank?: string
  syndicate?: string
}
```

### Contract Model

```typescript
interface Contract {
  id: string
  name: string
  description: string
  energyCost: number
  creditsReward: number
  xpReward: number
  lootChance: number
  difficulty: "easy" | "risky" | "elite" | "event"
}
```

### Crew Member Model

```typescript
interface CrewMember {
  name: string
  role: "Enforcer" | "Hacker" | "Smuggler"
  level: number
  bonus: string  // e.g., "+15% Combat DMG"
}
```

### Opponent Model

```typescript
interface Opponent {
  id: number
  name: string
  avatar: string  // Emoji or image URL
  powerLevel: number
  credits: number  // Reward on win
  xp: number       // XP reward on win
  adrenalCost: number
  cooldown: number  // Minutes until can attack again
}
```

### Outpost Model

```typescript
interface Outpost {
  id: number
  name: string
  type: string
  level: number
  incomeRate: number      // Credits per hour
  availableIncome: number // Accumulated income
  upgradeAvailable: boolean
}

interface MarketplaceOutpost extends Outpost {
  price: number
  requirements?: string   // e.g., "Level 30"
  locked: boolean
}
```

### Item/Equipment Model

```typescript
interface Item {
  id: string
  name: string
  rarity: "common" | "rare" | "epic" | "legendary"
  type: "weapon" | "armor" | "gadget" | "consumable"
  attackBoost?: number
  defenseBoost?: number
  specialBoost?: string
}
```

### Combat Result Model

```typescript
interface FightResult {
  outcome: "win" | "lose"
  damageDealt: number
  damageTaken: number
  creditsEarned: number
  xpGained: number
  streak: number
  loot?: string
}
```

### Daily Mission Model

```typescript
interface DailyMission {
  title: string
  description: string
  progress: number
  total: number
  rewards: {
    credits: number
    xp: number
  }
  completed?: boolean
}
```

### Feed Item Model

```typescript
interface FeedItem {
  id: string
  icon: React.ComponentType
  eventType: string
  message: string
  rewards?: Array<{
    type: "credits" | "xp" | "loot"
    amount: number | string
  }>
  timestamp: string
  priority?: "normal" | "important"
  variant?: "cyan" | "purple" | "orange" | "default"
  category: "all" | "crew" | "contracts" | "skirmish" | "outposts" | "system"
}
```

---

## Component Architecture

### Page Components
- Located in `app/[page]/page.tsx`
- Client components ("use client")
- Handle routing and page-level state
- Compose feature components

### Feature Components
- Located in `components/`
- Reusable, feature-specific components
- Examples: `ContractCard`, `CrewMemberCard`, `OpponentCard`

### UI Primitives
- Located in `components/ui/`
- shadcn/ui components
- Radix UI primitives with Tailwind styling
- Examples: `Button`, `Card`, `Dialog`, `Tabs`

### Shared Components
- `HudBar`: Resource display (always visible)
- `BottomNav`: Navigation bar
- `IdentityCard`: Player identity display

---

## State Management

### Current Approach
- **Local State**: `useState` for component-level state
- **Router**: Next.js `useRouter` for navigation
- **No Global State**: Each page manages its own data

### Data Flow
1. Pages fetch/define mock data locally
2. Pass data down to components as props
3. Components update local state for UI interactions
4. No persistence layer yet (all client-side)

### Future Considerations
- Context API for global player state
- State management library (Zustand, Redux) if needed
- Backend API integration for persistent data

---

## Routing

### App Router Structure
- `/` - Main dashboard
- `/contracts` - Contracts page
- `/skirmish` - Combat page
- `/crew` - Crew management
- `/outposts` - Outpost management
- `/loadout` - Equipment
- `/medbay` - Health/recovery
- `/comms` - Activity feed
- `/overseer` - Daily missions & events
- `/settings` - Settings

### Navigation
- `BottomNav` component for main navigation
- Back buttons on sub-pages
- Router-based navigation with `useRouter`

---

## Styling System

### Tailwind CSS Configuration
- Custom color scheme:
  - `neon-cyan`: Primary accent
  - `neon-purple`: Secondary accent
  - `neon-orange`: Tertiary accent
  - `success`: Success states
  - `destructive`: Error/danger states

### Design Tokens
- Dark theme by default
- Monospace fonts for technical feel
- Backdrop blur effects for glassmorphism
- Gradient backgrounds for progress bars

### Component Variants
- Color variants: `cyan`, `purple`, `orange`, `default`
- Size variants: Standard shadcn/ui sizes
- State variants: `active`, `disabled`, `hover`

---

## API & Backend (Future)

### Current State
- **No backend**: All data is mock/client-side
- **No API**: No server endpoints
- **No database**: No persistence

### Planned Integration Points
- Player data API
- Contract execution API
- Combat resolution API
- Crew management API
- Outpost income calculation API
- Equipment/inventory API

---

## Performance Considerations

### Current Optimizations
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Client-side rendering for interactivity

### Future Optimizations
- Server-side rendering for initial load
- API route caching
- Database query optimization
- Asset optimization (images, fonts)

---

## Development Guidelines

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Props interfaces for all components
- Descriptive variable names

### Component Patterns
- Single responsibility
- Composition over inheritance
- Props drilling acceptable for now (consider Context if deep)
- Reusable UI primitives from shadcn/ui

### File Naming
- Components: `kebab-case.tsx`
- Pages: `page.tsx` (Next.js convention)
- Types: Inline or separate `types.ts` files

