-- WKH-COBRAYA-DAPP-SHELL — cobraya_profiles table for PyME onboarding.
-- DD-O: prefix `cobraya_` to coexist with other apps on shared Supabase project.

CREATE TABLE IF NOT EXISTS public.cobraya_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  rfc TEXT,
  sector TEXT,
  anchor_buyers TEXT[],
  monto_tipico_mxn NUMERIC(12,2),
  mayor_frustracion TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS — CD-21
ALTER TABLE public.cobraya_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cobraya users can read own profile"
  ON public.cobraya_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Cobraya users can update own profile"
  ON public.cobraya_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile row on signup (DD-O: guarded by app metadata)
CREATE OR REPLACE FUNCTION public.cobraya_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Guard: only create cobraya_profiles when signup came from Cobraya.
  IF NEW.raw_user_meta_data->>'app' = 'cobraya' THEN
    INSERT INTO public.cobraya_profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS cobraya_on_auth_user_created ON auth.users;
CREATE TRIGGER cobraya_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.cobraya_handle_new_user();

-- updated_at auto-update
CREATE OR REPLACE FUNCTION public.cobraya_touch_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cobraya_on_profile_update ON public.cobraya_profiles;
CREATE TRIGGER cobraya_on_profile_update
  BEFORE UPDATE ON public.cobraya_profiles
  FOR EACH ROW EXECUTE FUNCTION public.cobraya_touch_profile_updated_at();
