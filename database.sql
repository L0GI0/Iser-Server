CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE DATABASE iserDb;

/* User account: */

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; /* for uuid_generate_v4() */

CREATE DOMAIN available_user_types VARCHAR(25) CHECK( value in ('customer', 'user', 'admin'));

CREATE DOMAIN user_status VARCHAR(25) CHECK( value in ('banned', 'active'));

CREATE TABLE users (
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL UNIQUE,
    user_password TEXT NOT NULL,
    user_type available_user_types,
    user_status user_status
);

/* User profile: */

CREATE DOMAIN gender VARCHAR(25) CHECK( value in ('Famale', 'Male', 'Other'));

CREATE DOMAIN lng VARCHAR(255) CHECK( value in ('en-GB', 'pl', 'de', 'fr'));

CREATE DOMAIN user_role VARCHAR(255) CHECK( value in ('admin', 'user'));

CREATE TABLE profiles (
	profile_id uuid NOT NULL,
	first_name VARCHAR(255),
	last_name VARCHAR(255),
	gend gender,
  birth_date DATE,
  location TEXT,
  language lng,
  role VARCHAR(255),
  CONSTRAINT fk_user_id FOREIGN KEY (profile_id) REFERENCES users(user_id));

--psql -U postgres
--\c jwttutorial - that will connect to jwttutorial db
-- \dt - lists all tables
-- heroku pg: psql - that will connect to heroku that gives the database automatically

INSERT INTO profiles VALUES ('20c3c6c4-691a-4a68-bfa2-7ac3cf1573d8', 'Walter', 'White', 'Male', '1973-03-23', 'New Mexico', 'en-GB', 'Cook');
INSERT INTO profiles VALUES ('affcdf8f-dbe7-4e9d-85f1-728c4e29dfbf', 'Gus', 'Fring', 'Male', '1974-04-22', 'New Mexico', 'en-GB', 'CEO');

UPDATE profiles SET (first_name, last_name, gend, birth_date, location, language, role) = ('Gus', 'Fring', 'Male', '1974-04-22', 'New Mexico', 'English', 'CEO') WHERE profile_id = 'affcdf8f-dbe7-4e9d-85f1-728c4e29dfbf' RETURNING *;

DELETE FROM profiles WHERE profile_id = '20c3c6c4-691a-4a68-bfa2-7ac3cf1573d8';