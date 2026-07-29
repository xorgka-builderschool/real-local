-- The two seeded demo reviewers had @handle-style names, which made their
-- review avatar initial show "@" instead of a letter. Give them normal
-- display names instead.
update public.profiles set name = 'Traveler Kim' where id = '00000000-0000-0000-0000-000000000011';
update public.profiles set name = 'Noodle Hunter' where id = '00000000-0000-0000-0000-000000000012';
