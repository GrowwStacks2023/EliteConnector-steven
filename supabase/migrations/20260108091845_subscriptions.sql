-- Subscription tiers enum matching your pricing
create type subscription_tier as enum ('tier_1', 'tier_2', 'tier_3');
create type subscription_status as enum ('active', 'canceled', 'past_due', 'incomplete', 'trialing');

-- Customers table
create table public.customers (
  id uuid references auth.users(id) on delete cascade not null primary key,
  stripe_customer_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table with credits
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status subscription_status,
  tier subscription_tier not null,
  price_id text,
  credits integer not null default 0,
  used_credits integer not null default 0,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;

-- RLS Policies
create policy "Users can view their own customer data"
  on public.customers for select
  using (auth.uid() = id);

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Indexes
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_stripe_customer_id_idx on public.subscriptions(stripe_customer_id);

-- Function to reset credits monthly
create or replace function reset_monthly_credits()
returns void as $$
begin
  update public.subscriptions
  set used_credits = 0,
      updated_at = now()
  where current_period_end < now()
    and status = 'active';
end;
$$ language plpgsql security definer;