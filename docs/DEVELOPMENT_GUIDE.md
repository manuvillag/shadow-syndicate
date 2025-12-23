# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ (or latest LTS)
- pnpm (package manager)
- Git

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Development Server
- Runs on `http://localhost:3000` by default
- Hot reload enabled
- TypeScript type checking

---

## Code Style & Conventions

### TypeScript
- **Strict mode**: Enabled
- **Type everything**: Avoid `any`, use proper types
- **Interfaces**: Use interfaces for object shapes
- **Type inference**: Let TypeScript infer when obvious

### Component Structure
```typescript
"use client"  // If using hooks/interactivity

import { ... } from "..."

interface ComponentProps {
  // Props interface
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState()
  
  // Handlers
  const handleClick = () => { ... }
  
  // Render
  return (
    <div>...</div>
  )
}
```

### Naming Conventions
- **Components**: PascalCase (`ContractCard.tsx`)
- **Files**: kebab-case for utilities (`use-toast.ts`)
- **Variables**: camelCase (`playerData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CREW_SIZE`)
- **Types/Interfaces**: PascalCase (`PlayerData`)

### File Organization
- One component per file
- Co-locate related types with components
- Shared types in separate `types.ts` if reused
- Utilities in `lib/` directory

---

## Adding New Features

### 1. Create Page Route
```typescript
// app/new-feature/page.tsx
"use client"

import { HudBar } from "@/components/hud-bar"
import { BottomNav } from "@/components/bottom-nav"

export default function NewFeaturePage() {
  // Page implementation
}
```

### 2. Create Components
```typescript
// components/new-feature-card.tsx
interface NewFeatureCardProps {
  // Props
}

export function NewFeatureCard({ ... }: NewFeatureCardProps) {
  // Component implementation
}
```

### 3. Add Navigation
- Update `BottomNav` if needed
- Add route to main dashboard `ActionTile` if needed
- Update routing logic

### 4. Define Data Models
```typescript
// In component or separate types file
interface NewFeatureData {
  id: string
  // ... properties
}
```

---

## State Management Patterns

### Local State
```typescript
const [state, setState] = useState<Type>(initialValue)
```

### Form State
```typescript
// Use React Hook Form for forms
import { useForm } from "react-hook-form"
```

### Navigation
```typescript
import { useRouter } from "next/navigation"

const router = useRouter()
router.push("/path")
```

### Toast Notifications
```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()
toast({
  title: "Success",
  description: "Action completed",
})
```

---

## Styling Guidelines

### Tailwind CSS
- Use utility classes
- Prefer composition over custom CSS
- Use design tokens (colors, spacing)

### Color Variants
```typescript
// Standard variants
variant: "cyan" | "purple" | "orange" | "default"

// Usage in components
className={cn(
  "base-classes",
  variant === "cyan" && "text-neon-cyan",
  variant === "purple" && "text-neon-purple",
)}
```

### Responsive Design
- Mobile-first approach
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test on mobile devices

### Dark Theme
- Dark theme is default
- Use semantic color tokens:
  - `background`: Main background
  - `foreground`: Text color
  - `muted-foreground`: Secondary text
  - `border`: Border color
  - `card`: Card background

---

## Component Patterns

### Card Component
```typescript
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Modal/Dialog
```typescript
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>
```

### Button Variants
```typescript
<Button variant="default" size="default">
  Default
</Button>
<Button variant="destructive">
  Destructive
</Button>
<Button variant="ghost">
  Ghost
</Button>
```

---

## Data Flow

### Current Pattern (Mock Data)
1. Define mock data in page component
2. Pass as props to child components
3. Update local state for UI interactions
4. No persistence (yet)

### Future Pattern (With Backend)
1. Fetch data from API in page component
2. Use React Query or SWR for caching
3. Mutations update server state
4. Optimistic updates for better UX

---

## Testing Strategy (Future)

### Unit Tests
- Test utility functions
- Test component logic
- Use Vitest or Jest

### Component Tests
- Test component rendering
- Test user interactions
- Use React Testing Library

### E2E Tests
- Test critical user flows
- Use Playwright or Cypress

---

## Performance Best Practices

### Code Splitting
- Next.js handles automatic code splitting
- Use dynamic imports for heavy components:
```typescript
const HeavyComponent = dynamic(() => import("./heavy-component"))
```

### Image Optimization
```typescript
import Image from "next/image"

<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority  // For above-fold images
/>
```

### Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies])
```

---

## Debugging

### Console Logs
```typescript
console.log("[Feature] Action:", data)
// Use prefixes for easy filtering
```

### React DevTools
- Install React DevTools browser extension
- Inspect component tree
- Check props and state

### TypeScript Errors
- Check terminal for type errors
- Fix type mismatches
- Use type assertions sparingly

---

## Git Workflow

### Branch Naming
- `feature/feature-name`: New features
- `fix/bug-name`: Bug fixes
- `refactor/component-name`: Refactoring

### Commit Messages
```
feat: Add contract execution system
fix: Resolve health regeneration bug
refactor: Simplify crew card component
docs: Update component reference
```

### Pull Requests
- Clear description of changes
- Reference related issues
- Request review before merging

---

## Common Tasks

### Adding a New Resource Type
1. Update `PlayerData` interface
2. Add to `HudBar` component
3. Update all pages that use player data
4. Add to mock data

### Adding a New Difficulty Tier
1. Update type definitions (e.g., `Contract.difficulty`)
2. Add filter option in UI
3. Update styling/variants
4. Add sample data

### Creating a New Modal
1. Use `Dialog` from `components/ui/dialog`
2. Create component in `components/`
3. Manage open/close state in parent
4. Handle confirm/cancel actions

### Adding a New Page
1. Create `app/[page-name]/page.tsx`
2. Add `HudBar` and `BottomNav`
3. Implement page content
4. Add navigation link
5. Update routing

---

## Troubleshooting

### Build Errors
- Check TypeScript errors: `pnpm build`
- Verify all imports are correct
- Check for missing dependencies

### Runtime Errors
- Check browser console
- Verify component props
- Check state updates

### Styling Issues
- Verify Tailwind classes
- Check for conflicting styles
- Verify responsive breakpoints

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev) (validation)

---

## Future Improvements

### Backend Integration
- API routes for game logic
- Database for persistence
- Authentication system
- Real-time updates

### State Management
- Context API for global state
- Zustand or Redux if needed
- Server state management (React Query)

### Testing
- Unit tests
- Integration tests
- E2E tests

### Performance
- Server-side rendering
- API caching
- Image optimization
- Bundle size optimization

