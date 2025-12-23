# Quick Reference Guide

## 🎯 Game Systems at a Glance

### Resources
| Resource | Purpose | Regeneration |
|----------|---------|--------------|
| **Credits** | Main currency | Earned from activities |
| **Alloy** | Premium currency | Purchased only |
| **Charge** | Contract energy | Regenerates over time |
| **Adrenal** | Combat energy | Regenerates over time |
| **Health** | Combat health | Natural regeneration |
| **XP** | Progression | Earned from all activities |

### Main Activities
1. **Contracts** → Spend Charge → Get Credits/XP/Loot
2. **Skirmish** → Spend Adrenal → Get Credits/XP (win) or lose Health (lose)
3. **Outposts** → Collect income → Passive Credits
4. **Crew** → Purchase crew members → Combat power (Attack/Defense stats)
5. **Loadout** → Equip items → Combat bonuses

---

## 📊 Data Models Quick Reference

### Player Data
```typescript
{
  credits: number
  alloy: number
  level: number
  xpCurrent: number
  xpMax: number
  charge: number
  chargeMax: number
  adrenal: number
  adrenalMax: number
  crewSize: number
  crewMax: number
}
```

### Contract
```typescript
{
  id: string
  name: string
  difficulty: "easy" | "risky" | "elite" | "event"
  energyCost: number
  creditsReward: number
  xpReward: number
  lootChance: number
}
```

### Crew Member
```typescript
{
  name: string
  role: "Enforcer" | "Hacker" | "Smuggler"
  level: number
  bonus: string
}
```

### Opponent
```typescript
{
  id: number
  name: string
  powerLevel: number
  credits: number
  xp: number
  adrenalCost: number
  cooldown: number
}
```

---

## 🗂️ File Locations

### Pages
- Main Dashboard: `app/page.tsx`
- Contracts: `app/contracts/page.tsx`
- Skirmish: `app/skirmish/page.tsx`
- Crew: `app/crew/page.tsx`
- Outposts: `app/outposts/page.tsx`
- Loadout: `app/loadout/page.tsx`
- Medbay: `app/medbay/page.tsx`
- Comms: `app/comms/page.tsx`
- Overseer: `app/overseer/page.tsx`
- Settings: `app/settings/page.tsx`

### Key Components
- `HudBar`: `components/hud-bar.tsx`
- `BottomNav`: `components/bottom-nav.tsx`
- `ContractCard`: `components/contract-card.tsx`
- `OpponentCard`: `components/opponent-card.tsx`
- `CrewMemberCard`: `components/crew-member-card.tsx`
- `OutpostCard`: `components/outpost-card.tsx`
- `ItemCard`: `components/item-card.tsx`

---

## 🎨 Color Variants

### Standard Variants
- `cyan` - Primary actions, contracts
- `purple` - Combat, skirmish
- `orange` - Warnings, outposts
- `default` - Neutral elements

### Usage
```typescript
<Button variant="cyan">Action</Button>
<FilterChip variant="purple" />
```

---

## 🔧 Common Patterns

### Page Structure
```typescript
export default function Page() {
  const router = useRouter()
  
  const playerData = { /* ... */ }
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <HudBar {...playerData} />
      {/* Page content */}
      <BottomNav activeTab="..." />
    </div>
  )
}
```

### Modal Pattern
```typescript
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Navigation
```typescript
import { useRouter } from "next/navigation"

const router = useRouter()
router.push("/path")
```

---

## 📝 Naming Conventions

- **Components**: PascalCase (`ContractCard.tsx`)
- **Files**: kebab-case (`use-toast.ts`)
- **Variables**: camelCase (`playerData`)
- **Types**: PascalCase (`PlayerData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CREW_SIZE`)

---

## 🚀 Common Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint code

# Package management
pnpm install      # Install dependencies
pnpm add <pkg>    # Add dependency
pnpm remove <pkg> # Remove dependency
```

---

## 🔗 Important Links

- [Game Design](./GAME_DESIGN.md) - Full game mechanics
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) - Tech details
- [Component Reference](./COMPONENT_REFERENCE.md) - All components
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Coding standards
- [Roadmap](./ROADMAP.md) - Future features

---

## 💡 Quick Tips

1. **Always include HudBar** on pages for resource display
2. **Use BottomNav** for consistent navigation
3. **Mock data** is currently in page components (will move to API)
4. **Type everything** - TypeScript strict mode is enabled
5. **Follow component patterns** from existing code
6. **Use shadcn/ui** components from `components/ui/`
7. **Color variants** should match game theme (cyan/purple/orange)

---

## 🐛 Debugging

### Check Console
- Look for `[v0]` prefixed logs
- Check for TypeScript errors in terminal
- Verify component props match interfaces

### Common Issues
- **Missing props**: Check component interface
- **Type errors**: Verify data types match
- **Styling issues**: Check Tailwind classes
- **Navigation**: Verify route paths

---

## 📦 Key Dependencies

- `next`: Framework
- `react`: UI library
- `typescript`: Type safety
- `tailwindcss`: Styling
- `@radix-ui/*`: UI primitives
- `lucide-react`: Icons
- `react-hook-form`: Forms
- `zod`: Validation
- `recharts`: Charts

---

## 🎯 Current Focus Areas

1. **Backend Integration** - API routes and database
2. **Game Logic** - Real calculations instead of mocks
3. **Persistence** - Save player progress
4. **Energy Systems** - Time-based regeneration
5. **Combat System** - Real win/loss calculations

---

*Last Updated: [Current Date]*

