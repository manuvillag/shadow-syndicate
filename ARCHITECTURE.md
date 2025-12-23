# Technical Architecture Document

## 🏗️ Shadow Syndicate - Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (React)                  │   │
│  │  - App Router Pages                              │   │
│  │  - React Components                               │   │
│  │  - Client-side State (useState, Context)         │   │
│  │  - API Calls (fetch/axios)                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (To Be Implemented)            │
│  ┌──────────────────────────────────────────────────┐   │
│  │         API Server (Node.js/Express)             │   │
│  │  - REST Endpoints                                │   │
│  │  - WebSocket Server (real-time updates)          │   │
│  │  - Authentication (JWT)                            │   │
│  │  - Game Logic                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                                │
│                          ▼                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Database Layer                       │   │
│  │  - PostgreSQL/MongoDB                            │   │
│  │  - Redis (caching, sessions)                      │   │
│  │  - Game State Storage                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Next.js App Router Structure

```
app/
├── layout.tsx              # Root layout (providers, metadata)
├── page.tsx                # Home dashboard
├── globals.css             # Global styles
│
├── contracts/
│   └── page.tsx            # Contracts page
├── skirmish/
│   └── page.tsx            # Skirmish page
├── crew/
│   └── page.tsx            # Crew page
├── outposts/
│   └── page.tsx            # Outposts page
├── loadout/
│   └── page.tsx            # Loadout page
├── medbay/
│   └── page.tsx            # Medbay page
├── comms/
│   └── page.tsx            # Comms page
├── overseer/
│   └── page.tsx            # Overseer page
└── settings/
    └── page.tsx            # Settings page
```

### Component Architecture

```
components/
├── ui/                     # Reusable UI primitives (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
│
├── hud-bar.tsx             # Top HUD (resources, XP)
├── bottom-nav.tsx          # Bottom navigation
├── identity-card.tsx       # Player profile
│
├── contract-card.tsx       # Contract display
├── contract-confirmation-modal.tsx
├── result-modal.tsx
│
├── opponent-card.tsx       # Skirmish opponent
├── fight-result-modal.tsx
│
├── crew-stats-card.tsx     # Crew statistics
├── crew-member-card.tsx
├── recruit-panel.tsx
│
├── outpost-card.tsx        # Owned outpost
├── marketplace-card.tsx   # Available outpost
│
├── item-card.tsx           # Equipment item
│
├── health-status-card.tsx  # Health display
├── heal-options-card.tsx
├── combat-log-card.tsx
│
├── mission-card.tsx        # Daily mission
├── limited-offer-card.tsx
├── syndicate-directive-card.tsx
├── streak-tracker.tsx
├── event-banner.tsx
│
├── feed-item-card.tsx      # Activity feed item
├── comms-empty-state.tsx
│
└── [shared components]     # Filter chips, resource chips, etc.
```

### State Management Strategy

#### Current Approach (Client-Side Only)
- **Local State**: `useState` for component-specific state
- **Router State**: Next.js `useRouter` for navigation
- **No Global State**: Each page manages its own data

#### Future Approach (With Backend)
- **Server State**: React Query / SWR for API data
- **Global State**: Context API or Zustand for shared state
- **Real-time**: WebSocket for live updates (resources, notifications)

### Data Flow

#### Current (Mock Data)
```
Component → useState → Render
```

#### Future (With Backend)
```
Component → API Call → Backend → Database
                ↓
         React Query Cache
                ↓
         Component Re-render
```

---

## Backend Architecture (Planned)

### API Structure

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /refresh
│   └── POST /logout
│
├── /player
│   ├── GET /profile
│   ├── PUT /profile
│   └── GET /stats
│
├── /contracts
│   ├── GET /list
│   ├── POST /execute/:id
│   └── GET /history
│
├── /skirmish
│   ├── GET /opponents
│   ├── POST /engage/:id
│   └── GET /history
│
├── /crew
│   ├── GET /members
│   ├── POST /recruit
│   └── PUT /member/:id
│
├── /outposts
│   ├── GET /owned
│   ├── GET /marketplace
│   ├── POST /purchase/:id
│   ├── POST /collect/:id
│   └── POST /upgrade/:id
│
├── /loadout
│   ├── GET /equipment
│   ├── PUT /equip/:id
│   └── GET /inventory
│
├── /resources
│   ├── GET /current
│   ├── POST /regenerate
│   └── GET /history
│
└── /events
    ├── GET /daily-missions
    ├── POST /complete-mission/:id
    └── GET /directives
```

### Database Schema (Planned)

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  handle VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP,
  last_login TIMESTAMP
);
```

#### Player Data Table
```sql
CREATE TABLE player_data (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  level INTEGER DEFAULT 1,
  xp_current INTEGER DEFAULT 0,
  xp_max INTEGER DEFAULT 1000,
  credits BIGINT DEFAULT 0,
  alloy INTEGER DEFAULT 0,
  charge INTEGER DEFAULT 100,
  charge_max INTEGER DEFAULT 100,
  adrenal INTEGER DEFAULT 50,
  adrenal_max INTEGER DEFAULT 50,
  health INTEGER DEFAULT 100,
  rank VARCHAR(50),
  syndicate VARCHAR(100),
  updated_at TIMESTAMP
);
```

#### Contracts Table
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  energy_cost INTEGER,
  credits_reward INTEGER,
  xp_reward INTEGER,
  loot_chance INTEGER,
  difficulty VARCHAR(20),
  created_at TIMESTAMP
);
```

#### Contract History Table
```sql
CREATE TABLE contract_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  contract_id UUID REFERENCES contracts(id),
  executed_at TIMESTAMP,
  success BOOLEAN,
  rewards_credits INTEGER,
  rewards_xp INTEGER,
  loot_item_id UUID
);
```

#### Crew Members Table
```sql
CREATE TABLE crew_members (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  role VARCHAR(20),
  level INTEGER DEFAULT 1,
  bonus_type VARCHAR(50),
  bonus_value DECIMAL,
  recruited_at TIMESTAMP
);
```

#### Outposts Table
```sql
CREATE TABLE outposts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  type VARCHAR(50),
  level INTEGER DEFAULT 1,
  income_rate INTEGER,
  last_collected TIMESTAMP,
  purchased_at TIMESTAMP
);
```

#### Equipment Table
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  rarity VARCHAR(20),
  type VARCHAR(20),
  attack_boost INTEGER,
  defense_boost INTEGER,
  special_boost TEXT,
  equipped BOOLEAN DEFAULT FALSE,
  obtained_at TIMESTAMP
);
```

### Caching Strategy

#### Redis Usage
- **Session Storage**: User sessions, JWT tokens
- **Resource Cache**: Player stats (5-minute TTL)
- **Leaderboards**: Cached rankings (1-minute TTL)
- **Rate Limiting**: API request limits

#### Cache Invalidation
- **On Update**: Invalidate player cache on resource changes
- **Time-based**: Auto-expire after TTL
- **Event-based**: Invalidate on major actions

---

## Real-time Updates

### WebSocket Events

#### Client → Server
```typescript
{
  "type": "subscribe",
  "channel": "player:resources"
}

{
  "type": "action",
  "action": "execute_contract",
  "contract_id": "uuid"
}
```

#### Server → Client
```typescript
{
  "type": "resource_update",
  "data": {
    "charge": 85,
    "adrenal": 42,
    "credits": 125780
  }
}

{
  "type": "notification",
  "data": {
    "title": "Contract Complete",
    "message": "Rewards earned",
    "rewards": {...}
  }
}
```

### Resource Regeneration

#### Server-Side Timer
- **Charge**: Regenerate 1 per 5 minutes
- **Adrenal**: Regenerate 1 per 6 minutes
- **Health**: Regenerate 1% per hour (if below 100%)

#### Implementation
- Background job (cron or queue)
- Update database
- Push WebSocket update to connected clients
- Fallback: Calculate on client request if not connected

---

## Security Considerations

### Authentication
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Long-lived sessions
- **Password Hashing**: bcrypt with salt
- **Rate Limiting**: Prevent abuse

### Data Validation
- **Input Validation**: Zod schemas on API
- **SQL Injection**: Parameterized queries
- **XSS Prevention**: Sanitize user input
- **CSRF Protection**: Token-based validation

### Game Security
- **Server-Side Validation**: All game logic on server
- **Anti-Cheat**: Validate actions server-side
- **Resource Verification**: Prevent client manipulation
- **Rate Limiting**: Prevent spam actions

---

## Performance Optimization

### Frontend
- **Code Splitting**: Next.js automatic splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports for heavy components
- **Memoization**: React.memo, useMemo for expensive renders

### Backend
- **Database Indexing**: Index on user_id, timestamps
- **Query Optimization**: Efficient queries, avoid N+1
- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Database connection management

### CDN & Assets
- **Static Assets**: Serve from CDN
- **Image CDN**: Optimize and cache images
- **Font Loading**: Preload critical fonts

---

## Deployment Architecture

### Production Setup
```
┌─────────────────┐
│   CDN (Vercel)   │  ← Static assets, images
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Next.js App    │  ← Frontend (Vercel/Netlify)
│  (SSR/SSG)      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  API Server     │  ← Backend (Railway/Render/AWS)
│  (Node.js)      │
└─────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Postgres│ │ Redis  │  ← Database & Cache
└────────┘ └────────┘
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Authentication
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# API
API_URL=https://api.shadowsyndicate.com
WS_URL=wss://api.shadowsyndicate.com

# External Services
EMAIL_SERVICE_API_KEY=...
ANALYTICS_ID=...
```

---

## Monitoring & Logging

### Application Monitoring
- **Error Tracking**: Sentry or similar
- **Performance**: Vercel Analytics, Web Vitals
- **Uptime**: Health check endpoints
- **Logging**: Structured logging (Winston, Pino)

### Game Metrics
- **Player Activity**: DAU, MAU
- **Retention**: Day 1, 7, 30 retention
- **Economy**: Resource flow, spending patterns
- **Engagement**: Session length, actions per session

---

## Development Workflow

### Local Development
```bash
# Frontend
pnpm dev              # Next.js dev server (port 3000)

# Backend (future)
npm run dev:api       # API server (port 3001)

# Database
docker-compose up     # Local Postgres + Redis
```

### Testing Strategy
- **Unit Tests**: Jest for utilities
- **Component Tests**: React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for critical flows

### CI/CD Pipeline
1. **Lint & Type Check**: ESLint, TypeScript
2. **Tests**: Run test suite
3. **Build**: Verify production build
4. **Deploy**: Auto-deploy on main branch
5. **Smoke Tests**: Verify deployment

---

## Technology Decisions

### Why Next.js?
- **SSR/SSG**: Better SEO, performance
- **App Router**: Modern React patterns
- **File-based Routing**: Simple structure
- **Built-in Optimizations**: Image, font optimization

### Why TypeScript?
- **Type Safety**: Catch errors early
- **Better DX**: Autocomplete, refactoring
- **Documentation**: Types as documentation

### Why Tailwind CSS?
- **Utility-First**: Rapid development
- **Consistency**: Design system built-in
- **Performance**: Purge unused styles
- **Customization**: Easy theme customization

### Why Radix UI?
- **Accessibility**: Built-in a11y
- **Unstyled**: Full design control
- **Composable**: Flexible components

---

## Future Considerations

### Scalability
- **Horizontal Scaling**: Stateless API servers
- **Database Sharding**: If needed for large user base
- **CDN**: Global content delivery
- **Load Balancing**: Distribute traffic

### Feature Additions
- **Real-time Chat**: WebSocket chat system
- **Push Notifications**: Browser notifications
- **Offline Support**: Service workers, PWA
- **Mobile App**: React Native wrapper

---

**Last Updated**: [Current Date]

