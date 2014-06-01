-- Scripts that create the required Database for Brain Games

CREATE TABLE users (
	id BIGSERIAL,
	email VARCHAR,
	password VARCHAR,
	firstname VARCHAR,
	lastname VARCHAR

    CONSTRAINT pk_users PRIMARY KEY (id)
);

CREATE TABLE games (
	id BIGSERIAL,
	name VARCHAR,
	category VARCHAR,
	description TEXT,
	link VARCHAR(20)

    CONSTRAINT pk_games PRIMARY KEY (id)
);

CREATE TABLE scores (
	id BIGSERIAL,
	user_id BIGINT,
	user_fullname VARCHAR,
	game_id BIGINT,
	game_name VARCHAR,
	date DATE,
	score JSON 

    CONSTRAINT pk_scores PRIMARY KEY (id)
);

CREATE TABLE game_access (
    id BIGSERIAL,
    game_id BIGINT,
    game_name VARCHAR,
    game_category VARCHAR,
    user_id BIGINT,
    user_fullname VARCHAR,
    access_date timestamp DEFAULT now(),

    CONSTRAINT pk_game_access PRIMARY KEY (id)
);
CREATE INDEX idx_game_access ON game_access USING btree (access_date);
CREATE INDEX idx_game_category ON game_access USING btree (game_category);

CREATE TABLE game_rating (
    id BIGSERIAL,
    game_id BIGINT,
    user_id BIGINT,
    rating INTEGER
);