# Debugging Guide

## Can't Login / Can't See Player

### Step 1: Check Supabase Settings

1. **Disable Email Confirmation (for development)**
   - Go to Supabase Dashboard → Authentication → Settings
   - Under "Email Auth", find "Confirm email"
   - **Disable it** for now (you can enable later for production)
   - This allows immediate login after signup

2. **Check RLS Policies**
   - Go to Supabase Dashboard → Table Editor → `players`
   - Click "Policies" tab
   - Make sure these policies exist:
     - "Players can insert own data" - allows authenticated users to insert
     - "Players can view own data" - allows authenticated users to view

### Step 2: Check What's Happening

**Check if user was created:**
1. Supabase Dashboard → Authentication → Users
2. Look for your email
3. Check if email is confirmed

**Check if player was created:**
1. Supabase Dashboard → Table Editor → `players`
2. Look for your handle
3. Check `user_id` matches the user ID from auth.users

**Check server logs:**
- Look at your terminal where `npm run dev` is running
- Look for `[API] Player creation error:` messages
- Check for any database errors

### Step 3: Manual Test

Try creating a player manually via Supabase SQL Editor:

```sql
-- First, get your user_id from auth.users
SELECT id, email FROM auth.users;

-- Then create a player (replace USER_ID_HERE with actual ID)
INSERT INTO players (
  user_id,
  handle,
  rank,
  syndicate,
  credits,
  alloy,
  level,
  xp_current,
  xp_max,
  charge,
  charge_max,
  adrenal,
  adrenal_max,
  health,
  health_max,
  crew_size,
  crew_max
) VALUES (
  'USER_ID_HERE',
  'TEST_PLAYER',
  'Initiate',
  'Independent',
  10000,
  0,
  1,
  0,
  1000,
  100,
  100,
  50,
  50,
  100,
  100,
  0,
  5
);
```

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing up/signing in
4. Look for any errors
5. Check Network tab → see what API calls are being made

### Common Issues

**Issue: "Unauthorized"**
- User not authenticated
- Session expired
- Need to sign in again

**Issue: "Player already exists"**
- User already has a player
- Check players table for your user_id

**Issue: "Handle already taken"**
- Someone else (or you) already used that handle
- Try a different handle

**Issue: RLS Policy Error**
- RLS is blocking the insert
- Check policies in Supabase
- Make sure "Players can insert own data" policy exists

### Quick Fix: Disable RLS Temporarily

For testing, you can temporarily disable RLS:

```sql
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable it after testing!**

```sql
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
```

