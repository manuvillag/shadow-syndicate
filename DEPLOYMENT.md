# Deployment Guide - Shadow Syndicate

## ✅ Multi-User Readiness

**Your app is ready for multiple users!**

- ✅ Row Level Security (RLS) policies in place
- ✅ Each user has isolated data (players, crew, outposts, inventory)
- ✅ Authentication system configured
- ✅ All data is separated by `user_id`

## 🚀 Vercel Deployment Checklist

### 1. Environment Variables Required

Add these in **Vercel Dashboard → Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

**Get these from:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 2. Supabase Settings

**Authentication → Settings:**
- ✅ Enable "Email" provider
- ⚠️ **For testing:** Disable "Confirm email" (users can sign up immediately)
- ⚠️ **For production:** Enable "Confirm email" (users verify email first)

**Authentication → URL Configuration:**
- Add your Vercel URL to "Site URL"
- Add your Vercel URL to "Redirect URLs" (for auth callbacks)

### 3. Database Migrations

Make sure all migrations are run in Supabase SQL Editor:
- ✅ `001_initial_schema.sql`
- ✅ `002_create_player_trigger.sql`
- ✅ `003_allow_anonymous_players.sql`
- ✅ `004_allow_anonymous_inserts.sql`
- ✅ `005_add_items_rls.sql`
- ✅ `006_outpost_templates.sql`
- ✅ `007_link_existing_outposts.sql`
- ✅ `008_outpost_special_features.sql`
- ✅ `009_mission_claims.sql`
- ✅ `010_seed_all_contracts.sql`
- ✅ `011_add_contract_level_requirements.sql`
- ✅ `012_add_crew_stats.sql`
- ✅ `013_crew_templates.sql`

### 4. Testing Multi-User Setup

1. **User 1:**
   - Sign up with email 1
   - Create player handle
   - Play the game

2. **User 2:**
   - Sign up with email 2 (different device/browser)
   - Create player handle
   - Play the game

3. **Verify Isolation:**
   - Each user should only see their own:
     - Player stats
     - Crew members
     - Outposts
     - Inventory
     - Contract executions
     - Combat logs

## 🐛 Troubleshooting "Stuck on Checking Authentication"

If you see "Checking authentication..." and it's stuck:

### Check 1: Environment Variables
- ✅ Go to Vercel Dashboard → Settings → Environment Variables
- ✅ Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set
- ✅ Redeploy after adding/changing variables

### Check 2: Supabase Connection
- ✅ Test connection: Visit `https://your-app.vercel.app/api/test`
- ✅ Should return JSON with `success: true`
- ✅ If error, check environment variables

### Check 3: Browser Console
- ✅ Open browser DevTools (F12)
- ✅ Check Console for errors
- ✅ Check Network tab for failed requests

### Check 4: Supabase Dashboard
- ✅ Go to Supabase → Authentication → Users
- ✅ Verify users can sign up
- ✅ Check if email confirmation is blocking

## 📱 Adding to iPhone Home Screen

1. Open your Vercel URL in Safari
2. Tap Share button (square with arrow)
3. Tap "Add to Home Screen"
4. App icon appears on home screen
5. Opens like a native app!

## 🔒 Security Notes

- ✅ RLS policies ensure users can only access their own data
- ✅ All API routes check authentication
- ✅ No user can see another user's data
- ✅ Crew, outposts, inventory all isolated per user

## 📊 Monitoring

- Check Vercel logs for errors
- Check Supabase logs for database errors
- Monitor authentication success/failure rates

---

**Ready to share!** Your app supports multiple concurrent users with complete data isolation.

