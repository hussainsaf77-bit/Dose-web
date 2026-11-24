-- Dose-web & Telegram Bot Unified Production Schema (Supabase PostgreSQL)
-- Run this script once in Supabase Dashboard -> SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users (unified across Web & Telegram Bot)
CREATE TABLE IF NOT EXISTS public.dose_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid text UNIQUE NOT NULL,
  email text UNIQUE,
  password_hash text,
  full_name text NOT NULL DEFAULT 'مستخدم جرعة',
  role text NOT NULL DEFAULT 'user',
  telegram_id text UNIQUE,
  telegram_username text,
  lang text NOT NULL DEFAULT 'ar',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dose_users_email ON public.dose_users (lower(email));
CREATE INDEX IF NOT EXISTS idx_dose_users_telegram_id ON public.dose_users (telegram_id);

-- 2. Subscription Plans Catalog
CREATE TABLE IF NOT EXISTS public.dose_plans (
  id text PRIMARY KEY,
  tier text NOT NULL CHECK (tier IN ('free', 'pro', 'vip')),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  price_usd numeric(10, 2) NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  daily_ai_limit integer NOT NULL DEFAULT 15,
  reminder_limit integer NOT NULL DEFAULT 5,
  paddle_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.dose_plans (id, tier, name_ar, name_en, price_usd, duration_days, daily_ai_limit, reminder_limit, sort_order)
VALUES
  ('free', 'free', 'الباقة المجانية', 'Free Plan', 0.00, 3650, 10, 3, 0),
  ('weekly', 'pro', 'أسبوعي — جرّب البوت', 'Weekly Pro', 0.99, 7, 250, 50, 1),
  ('monthly', 'pro', 'شهري — الأساسي', 'Monthly Pro', 2.99, 30, 250, 100, 2),
  ('3months', 'pro', '3 أشهر + شهر مجاناً', '3 Months Pro (+1 Free)', 6.99, 120, 500, 200, 3),
  ('6months', 'vip', '6 أشهر + شهران مجاناً', '6 Months VIP (+2 Free)', 11.99, 240, 9999, 999, 4),
  ('yearly', 'vip', 'سنوي + 6 أشهر مجاناً', 'Yearly VIP (+6 Free)', 19.99, 545, 9999, 999, 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Active & Historical Subscriptions
CREATE TABLE IF NOT EXISTS public.dose_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid text NOT NULL REFERENCES public.dose_users (uid) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.dose_plans (id),
  tier text NOT NULL CHECK (tier IN ('free', 'pro', 'vip')),
  status text NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'past_due', 'superseded')),
  source text NOT NULL CHECK (source IN ('paddle', 'promo_code', 'telegram_stars', 'local_transfer', 'admin_grant')),
  external_ref text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dose_subs_user_status ON public.dose_subscriptions (user_uid, status, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_dose_subs_external_ref ON public.dose_subscriptions (external_ref);

-- 4. One-Time or Multi-Use Activation Promo Codes (for local transfers & campaigns)
CREATE TABLE IF NOT EXISTS public.dose_promo_codes (
  code text PRIMARY KEY,
  plan_id text NOT NULL REFERENCES public.dose_plans (id),
  tier text NOT NULL CHECK (tier IN ('pro', 'vip')),
  duration_days integer NOT NULL DEFAULT 30,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- 5. Payment & Revenue Audit Log
CREATE TABLE IF NOT EXISTS public.dose_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid text REFERENCES public.dose_users (uid) ON DELETE SET NULL,
  provider text NOT NULL CHECK (provider IN ('paddle', 'telegram_stars', 'local_transfer', 'promo_code')),
  external_tx_id text UNIQUE,
  amount_usd numeric(10, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  plan_id text,
  status text NOT NULL CHECK (status IN ('completed', 'pending', 'refunded', 'failed')),
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dose_payments_user ON public.dose_payments (user_uid, created_at DESC);

-- 6. Daily Usage Quotas (per user, per day, per action — safe for high concurrency)
CREATE TABLE IF NOT EXISTS public.dose_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid text NOT NULL,
  usage_date date NOT NULL DEFAULT current_date,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_uid, usage_date, action)
);

CREATE INDEX IF NOT EXISTS idx_dose_usage_lookup ON public.dose_usage_logs (user_uid, usage_date, action);

-- 7. Medication Reminders (one row per reminder — scalable across thousands of users)
CREATE TABLE IF NOT EXISTS public.dose_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid text NOT NULL,
  telegram_id text,
  drug_name text NOT NULL,
  dose text,
  times jsonb NOT NULL DEFAULT '[]'::jsonb,
  days jsonb NOT NULL DEFAULT '[]'::jsonb,
  timezone text NOT NULL DEFAULT 'Asia/Riyadh',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dose_reminders_user ON public.dose_reminders (user_uid, is_active);
CREATE INDEX IF NOT EXISTS idx_dose_reminders_tg ON public.dose_reminders (telegram_id, is_active);

-- Row-Level Security (Blocks direct anonymous tampering; server uses SUPABASE_SERVICE_ROLE_KEY)
ALTER TABLE public.dose_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active plans" ON public.dose_plans;
CREATE POLICY "Public read active plans"
  ON public.dose_plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
