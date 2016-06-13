drop table if exists objects;
create table objects (
  id integer primary key autoincrement,
  uuid text not null,
  nameEn text,
  json text not null
);
