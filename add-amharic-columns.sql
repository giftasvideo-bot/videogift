-- Additive and nullable: existing rows and the current code keep working.
-- Assumes the table is public.events; change the name if yours differs.
alter table public.events
  add column if not exists title_am       text,
  add column if not exists about_am       text,
  add column if not exists host_names_am  text,
  add column if not exists venue_am       text,
  add column if not exists message_am     text;

-- Per-day Amharic titles need no column: they live inside the existing
-- "days" JSON as "title_am" next to "title".
