-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)

-- 1. Create table for contact & feedback submissions
create table if not exists contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text default 'General Feedback',
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) for data protection
alter table contact_submissions enable row level security;

-- 3. Allow anonymous public submissions (inserts only)
drop policy if exists "Allow public anonymous submissions" on contact_submissions;
create policy "Allow public anonymous submissions"
  on contact_submissions
  for insert
  to anon
  with check (true);
