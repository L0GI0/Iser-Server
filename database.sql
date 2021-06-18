CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE DATABASE jwttutorial;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; // for uuid_generate_v4()

CREATE TABLE users (
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL UNIQUE,
    user_password TEXT NOT NULL
);

SELECT * FROM users;

INSERT INTO users (user_name, user_email, user_password) VALUES ('Bob', 'bob@email.com', 'bob');
INSERT INTO users (user_name, user_email, user_password) VALUES ('Fred', 'fred@email.com', 'fred');

--psql -U postgres
--\c jwttutorial - that will connect to jwttutorial db
-- \dt - lists all tables
-- heroku pg: psql - that will connect to heroku that gives the database automatically
