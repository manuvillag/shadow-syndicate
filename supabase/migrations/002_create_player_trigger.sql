-- Trigger to automatically create player record when user signs up
-- This is optional - you can also create players via API

-- Function to create player on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.players (user_id, handle, rank, syndicate)
  VALUES (
    NEW.id,
    'USER_' || SUBSTRING(NEW.id::text, 1, 8),
    'Initiate',
    'Independent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires after a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: This trigger creates a player with a default handle
-- Users should update their handle via the API after signup


