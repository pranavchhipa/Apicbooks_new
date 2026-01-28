-- Add favorite_genres column if it doesn't exist
alter table profiles 
add column if not exists favorite_genres text[] default '{}';

-- Ensure reading_goal exists (it might already, but this is safe)
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'reading_goal') then
        alter table profiles add column reading_goal integer default 12;
    end if;
end $$;
