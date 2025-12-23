## Content & Image Map

This document lists all the places in the game that **need images or rich content**, plus suggestions to expand content so the game has enough depth to last a long time.

---

## 1. Global / Layout

- **Dashboard background**
  - **Location**: `app/page.tsx`
  - **Current**: Uses a generated background (`/.jpg?key=bg&...query=dark space stars nebula purple blue cyberpunk subtle background`)
  - **What you need**:
    - 1–2 **high-res space station / nebula backdrops** that can be reused across the app.
  - **Long-term content idea**:
    - Seasonal/region-based backgrounds (e.g. Syndicate HQ, Outer Rim, Corporate Sector).

---

## 2. Contracts & Missions

- **Contract art**
  - **Location**: `components/contract-card.tsx`
  - **Current**: Generated contract art (`/.jpg?key=l8eal&...query=${getImageQuery()}`)
  - **Entities**:
    - Heist-style jobs, data theft, sabotage, escort, smuggling, assassinations.
  - **What you need**:
    - 10–30 **contract art pieces** grouped by theme:
      - Low-tier street jobs
      - Mid-tier corporate hits
      - High-tier interstellar heists
  - **Content expansion**:
    - Expand `contracts` table with:
      - More contract types (20–50+)
      - Factions (corp, gangs, government, rogue AIs)
      - Multi-step contract chains (mini story arcs).

- **Daily missions / Overseer**
  - **Location**: `app/overseer/page.tsx`, `components/mission-card.tsx`, `components/event-banner.tsx`, `components/limited-offer-card.tsx`, `components/syndicate-directive-card.tsx`
  - **Current**: Text-only with one generic banner image in `EventBanner`.
  - **What you need**:
    - 5–10 **mission/event banner arts** (raids, lockdowns, festivals, syndicate wars).
    - Icon set for **mission types** (raid, hack, smuggle, defend).
  - **Content expansion**:
    - Daily, weekly, seasonal mission lists (20–100+ templates).
    - Rotating **global directives** that buff/nerf parts of the game.

---

## 3. Skirmish / Combat

- **Opponents**
  - **Location**: `components/opponent-card.tsx`
  - **Current**: Generated portraits using URL:
    - `/space-crime-syndicate-opponent-.jpg?key=babi9&...query=space crime syndicate opponent ${name.toLowerCase()} portrait cyberpunk neon`
  - **Entities**:
    - Current named opponents (e.g. Scarlet Viper, Neon Ghost, Void Hunter, Cyber Reaper, Quantum Blade).
  - **What you need**:
    - 10–30 **character portraits** (mid-shot, cyberpunk, neon) for:
      - Named syndicate rivals
      - Faction leaders
      - Elite bounty targets
  - **Content expansion**:
    - Add more opponent tiers:
      - Street-level thugs → Lieutenants → Bosses.
    - Opponent factions with their own style and loot pools.

- **Combat log & Medbay**
  - **Location**: `components/combat-log-card.tsx`, `components/health-status-card.tsx`, `app/medbay/page.tsx`
  - **Current**: Icon-based (no specific art).
  - **What you need**:
    - 2–4 **Medbay illustrations** (auto-doc, recovery pod, triage bay).
    - Optional icons for **injury severity**.

---

## 4. Crew System

- **Crew members**
  - **Location**: `components/crew-member-card.tsx`
  - **Current**: Generated portraits:
    - `/.jpg?key=xwvbm&...query=${getRoleImageQuery()}`
  - **Roles**:
    - Enforcer, Hacker, Smuggler (and placeholder `Operative`).
  - **What you need**:
    - 3–5 portraits per role:
      - **Enforcers**: bruisers, ex-military, cyborgs.
      - **Hackers**: deckers, netrunners, rogue AIs.
      - **Smugglers**: pilots, fixers, fence contacts.
    - Total: 12–20 unique crew portraits.
  - **Content expansion**:
    - Add more roles: Medic, Handler, Fixer, Inside Man.
    - Crew traits (loyalty, risk, special perks).

---

## 5. Items, Weapons, Gear

- **Inventory / items**
  - **Location**: `components/item-card.tsx`, `app/inventory/page.tsx`, `app/loadout/page.tsx`
  - **Current**: Generated images:
    - `/.jpg?key=lueti&...query=${getImageQuery()}`
  - **Item categories**:
    - Weapons, Armor, Gadgets, Consumables (from DB `items` + UI).
  - **What you need**:
    - Weapons:
      - 10–20 unique weapon arts (pistols, rifles, cannons, blades).
    - Armor:
      - 8–15 suits/vests/exo-frames.
    - Gadgets:
      - 8–15 devices (implants, drones, scanners, jammers).
    - Consumables:
      - 6–10 stims, repair kits, boosters.
  - **Content expansion**:
    - Expand `items` table with:
      - Tiered gear (Common → Legendary).
      - Set bonuses (e.g. “Void Hunter set”).
      - Special effects tied to combat/contract logic.

---

## 6. Outposts & Economy

- **Owned outposts**
  - **Location**: `components/outpost-card.tsx`, `app/outposts/page.tsx`
  - **Current**: Generated backgrounds:
    - `/.jpg?key=outpost&...query=${getOutpostImage()}`
  - **Outpost types**:
    - Trading Post, Mining Station, Research Lab, Manufacturing Hub, Data Center (see marketplace presets).
  - **What you need**:
    - 5–10 **building/colony illustrations**:
      - One per outpost type, plus upgraded variants (LVL 5, LVL 10).
  - **Content expansion**:
    - More outpost archetypes (black markets, refineries, relay hubs).
    - Visual evolution by level (different art per tier).

- **Marketplace outposts**
  - **Location**: `components/marketplace-card.tsx`
  - **Current**: Generated:
    - `/.jpg?key=market&...query=${getPropertyImage()}`
  - **What you need**:
    - Reuse outpost art + special framing for “for sale” listings (UI overlay).

---

## 7. Events, Comms, Flavor

- **Comms empty state**
  - **Location**: `components/comms-empty-state.tsx`
  - **Current**: Generated:
    - `/.jpg?key=empty&...query=futuristic radio transmission tower...`
  - **What you need**:
    - 1–2 illustrations of **comms arrays / holo displays**.

- **Event banner**
  - **Location**: `components/event-banner.tsx`
  - **Current**: Generated:
    - `/.jpg?key=event&...query=dramatic space event explosion neon warning...`
  - **What you need**:
    - 3–6 event-specific banners:
      - Solar storms, station lockdowns, syndicate wars, AI uprisings.

---

## 8. Identity & HUD

- **Operator / profile**
  - **Location**: `components/identity-card.tsx`, `app/setup/page.tsx`
  - **Current**: Mostly icon/text-based.
  - **What you need**:
    - Optional **operator portrait** or emblem system (logos instead of faces).

- **HUD + Resources**
  - **Location**: `components/hud-bar.tsx`, `components/resource-chip.tsx`
  - **Current**: Icon/text only.
  - **What you need**:
    - Small icons for:
      - Credits, Alloy, Charge, Adrenal, Crew, Outposts.

---

## 9. Long-Term Content Plan (Slow, Deep Game)

To avoid a “fast” game and keep players engaged for a long time, plan for:

- **Contracts**
  - Target: **50–100+** distinct contracts.
  - Add:
    - Difficulty tiers, narrative arcs, randomness in rewards/risks.

- **Opponents**
  - Target: **30–50** enemy profiles.
  - Factions with their own:
    - Art, loot tables, special rules.

- **Items**
  - Target: **80–150** items total:
    - 30+ weapons
    - 20+ armor
    - 20+ gadgets
    - 10–20 consumables
  - With rarity distribution and unlock progression.

- **Outposts**
  - Target: **10–20** types, each upgradable to level 10.
  - Distinct visual + mechanical identity per type.

- **Crew**
  - Target: **20–40** named recruits with:
    - Unique portraits
    - Short backstories
    - Niche bonuses.

- **Events / Daily Systems**
  - Daily, weekly and seasonal events:
    - Rotating modifiers for contracts, skirmish, outposts.

---

## 10. Suggested Workflow

1. **Lock core lists first**:
   - Decide on:
     - Final list of item names
     - Outpost names/types
     - Opponent + crew names
     - Event names.
2. **Create an Art Brief per category**:
   - For each section above, write:
     - Short description
     - Mood / palette
     - Any UI constraints (aspect ratio, resolution).
3. **Replace generated URLs**:
   - When you have real art:
     - Swap `src=\"/.jpg?...query=...\"` with your CDN/`public/` paths.
4. **Iterate content numbers upward over time**:
   - Start with minimum viable (e.g. 10 contracts, 10 items) then grow.



