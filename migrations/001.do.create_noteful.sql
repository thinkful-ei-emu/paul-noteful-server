CREATE EXTENSION if not exists "uuid-ossp";
create table if not exists folders (
	id uuid primary key unique default uuid_generate_v4 (),
	name text not null
);

create table if not exists notes (
	id uuid primary key unique default uuid_generate_v4 (),
	name text not null,
	modified timestamp not null default now(),
	folderid uuid references folders(id) on delete cascade not null,
	content text not null
);

