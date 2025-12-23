# Shadow Syndicate • HQ

A space-themed mafia wars clone - a browser-based incremental RPG where players manage a space crime syndicate, execute contracts, engage in combat, recruit crew members, and build an empire of outposts.

## 🎮 Game Overview

**Shadow Syndicate** is a strategic incremental RPG set in a neon-noir cyberpunk space universe. Players take on the role of a space crime syndicate operator, building their reputation and power through various activities:

- **Contracts**: Execute missions for resources and XP
- **Skirmish**: Engage in combat against other operators
- **Crew Management**: Recruit and manage specialized crew members
- **Outposts**: Build and manage properties for passive income
- **Equipment**: Customize loadout for combat advantages
- **Progression**: Level up and unlock new content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or latest LTS)
- pnpm (package manager)

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
```

Visit `http://localhost:3000` to see the game.

## 📁 Project Structure

```
futuristic-rpg-dashboard/
├── app/                    # Next.js app router pages
│   ├── page.tsx            # Main dashboard
│   ├── contracts/          # Contracts page
│   ├── skirmish/           # Combat page
│   ├── crew/               # Crew management
│   ├── outposts/           # Outpost management
│   ├── loadout/            # Equipment
│   ├── medbay/             # Health/recovery
│   ├── comms/              # Activity feed
│   ├── overseer/           # Daily missions
│   └── settings/           # Settings
├── components/              # React components
│   ├── ui/                 # UI primitives (shadcn/ui)
│   └── [feature].tsx       # Feature components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Game Design](./docs/GAME_DESIGN.md)**: Game mechanics, systems, and balance
- **[Technical Architecture](./docs/TECHNICAL_ARCHITECTURE.md)**: Tech stack, data models, and architecture
- **[Component Reference](./docs/COMPONENT_REFERENCE.md)**: All components and their props
- **[Development Guide](./docs/DEVELOPMENT_GUIDE.md)**: Coding standards and best practices
- **[Roadmap](./docs/ROADMAP.md)**: Development roadmap and future features

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.10
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## 🎯 Current Status

### ✅ Completed
- UI/UX for all major game systems
- Responsive design
- Component library
- Navigation system

### 🚧 In Progress
- Backend API integration
- Game logic implementation
- Data persistence

### 📋 Planned
See [Roadmap](./docs/ROADMAP.md) for detailed feature plans.

## 🎨 Design System

### Color Scheme
- **Neon Cyan**: Primary accent color
- **Neon Purple**: Secondary accent color
- **Neon Orange**: Tertiary accent color
- **Dark Theme**: Default theme

### Typography
- **Sans**: Default font for UI
- **Mono**: Monospace font for technical/cyberpunk feel

## 🤝 Contributing

1. Follow the [Development Guide](./docs/DEVELOPMENT_GUIDE.md)
2. Use TypeScript strict mode
3. Follow component patterns
4. Write clear commit messages

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Status**: 🚧 In Development  
**Version**: 0.1.0
