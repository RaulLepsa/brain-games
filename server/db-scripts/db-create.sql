-- Scripts that create the required Database for Brain Games

CREATE TABLE users (
	id BIGSERIAL,
	email VARCHAR,
	password VARCHAR,
	firstname VARCHAR,
	lastname VARCHAR
);

CREATE TABLE games (
	id BIGSERIAL,
	name VARCHAR,
	category VARCHAR,
	description TEXT,
	link VARCHAR(20)
);

CREATE TABLE scores (
	id BIGSERIAL,
	user_id BIGINT,
	user_fullname VARCHAR,
	game_id BIGINT,
	game_name VARCHAR,
	date DATE,
	score JSON 
);