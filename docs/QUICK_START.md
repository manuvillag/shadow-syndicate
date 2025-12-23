# Quick Start Guide

After running the database migration, follow these steps to get your backend working.

## ✅ What's Done

- [x] Database schema created
- [x] Supabase client configured
- [x] API routes created
- [x] Player data hook created

## 🚀 Next Steps

### 1. Test Supabase Connection

Visit: `http://localhost:3000/api/test`

You should see:
```json
{
  "success": true,
  "message": "Supabase connection successful!",
  "authenticated": false,
  "userId": null,
  "contractsFound": true
}
```

If you see an error, check:
- `.env.local` file exists with correct keys
- Supabase project URL and publishable key are correct
- Database migration was run successfully

### 2. Set Up Authentication (Optional)

The database trigger (`002_create_player_trigger.sql`) will auto-create a player when a user signs up.

**To enable the trigger:**
1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/002_create_player_trigger.sql`

**Or create players manually via API:**
```typescript
POST /api/player
{
  "handle": "YOUR_HANDLE"
}
```

### 3. Test Player API

**Get player data:**
```bash
GET /api/player
```

**Create player (if not auto-created):**
```bash
POST /api/player
Content-Type: application/json

{
  "handle": "VOID_RUNNER_X"
}
```

### 4. Test Contracts API

**Get all contracts:**
```bash
GET /api/contracts
```

**Execute a contract:**
```bash
POST /api/contracts/execute
Content-Type: application/json

{
  "contractId": "contract-uuid-here"
}
```

## 🔧 Using in Your Frontend

### Example: Fetch Player Data

```typescript
import { usePlayer } from '@/hooks/use-player'

export default function Dashboard() {
  const { player, loading, error, refetch } = usePlayer()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!player) return <div>Not logged in</div>

  return (
    <div>
      <h1>Welcome, {player.handle}</h1>
      <p>Credits: {player.credits}</p>
      <p>Level: {player.level}</p>
    </div>
  )
}
```

### Example: Execute Contract

```typescript
async function executeContract(contractId: string) {
  const response = await fetch('/api/contracts/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contractId }),
  })
  
  const data = await response.json()
  
  if (data.error) {
    console.error('Error:', data.error)
  } else {
    console.log('Success!', data.rewards)
    // Refresh player data
    refetch()
  }
}
```

## 📋 API Endpoints Created

### Player
- `GET /api/player` - Get current player data
- `POST /api/player` - Create new player

### Contracts
- `GET /api/contracts` - Get all active contracts
- `POST /api/contracts/execute` - Execute a contract

### Crew
- `GET /api/crew` - Get player's crew members with stats
- `GET /api/crew/marketplace` - Browse available crew to purchase
- `POST /api/crew/purchase` - Purchase a crew member from marketplace

## 🎯 What's Next

1. **Replace mock data** in your pages with API calls
2. **Add authentication pages** (login/signup)
3. **Create more API routes** (crew, outposts, combat)
4. **Implement energy regeneration** (already in player API)

## 🐛 Troubleshooting

### "Unauthorized" errors
- Make sure you're authenticated
- Check Supabase RLS policies are set up correctly

### "Player not found"
- Run the player creation API or enable the trigger
- Check user_id matches auth.users

### Database connection errors
- Verify `.env.local` has correct keys
- Check Supabase project is active
- Verify migration was run successfully

## 📚 Full Documentation

- [Next Steps Guide](./NEXT_STEPS.md) - Complete implementation guide
- [API Reference](./NEXT_STEPS.md#step-5-api-routes) - All API endpoints
- [Component Reference](./COMPONENT_REFERENCE.md) - Frontend components


