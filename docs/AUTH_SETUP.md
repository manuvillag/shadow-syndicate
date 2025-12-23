# Authentication Setup Guide

## Supabase Email Confirmation

By default, Supabase requires email confirmation for new signups. You have two options:

### Option 1: Disable Email Confirmation (Development)

1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", disable "Confirm email"
3. Users can sign up and immediately sign in

### Option 2: Keep Email Confirmation (Production)

1. Users sign up → receive confirmation email
2. Click confirmation link → account activated
3. Sign in → redirected to setup if no player exists
4. Create player → start playing

## Current Flow

1. **Sign Up** (`/auth/signup`)
   - Creates Supabase account
   - If email confirmation required → shows message, redirects to sign in
   - If no confirmation → creates player immediately

2. **Sign In** (`/auth/signin`)
   - Authenticates user
   - Checks if player exists
   - Redirects to `/setup` if no player
   - Redirects to `/` if player exists

3. **Setup** (`/setup`)
   - Requires authentication
   - Creates player profile
   - Redirects to dashboard

## Troubleshooting

### "Can't see player in table"
- Check if user signed up successfully (check `auth.users` table)
- Check if email confirmation is required
- Check server logs for player creation errors
- Verify RLS policies allow inserts

### "Can't login"
- Check if email is confirmed (if confirmation required)
- Check Supabase Auth settings
- Verify email/password are correct
- Check browser console for errors

### "Unauthorized" errors
- User not authenticated
- Session expired
- Need to sign in again

## Quick Test

1. Disable email confirmation in Supabase (for development)
2. Sign up with test email
3. Should immediately create player
4. Check `players` table in Supabase

## Production Setup

For production:
1. Enable email confirmation
2. Set up email templates
3. Configure redirect URLs
4. Test full flow

