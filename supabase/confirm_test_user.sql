-- One-off: manually confirm the demo test account so it can log in without
-- clicking a real confirmation email. Run in the Supabase SQL Editor.
update auth.users
set email_confirmed_at = now()
where email = 'testtraveler260725@gmail.com'
  and email_confirmed_at is null;
