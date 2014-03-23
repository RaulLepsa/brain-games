-- Scripts that create the required Database for Brain Games

CREATE TABLE users (
	id BIGSERIAL,
	email VARCHAR,
	password VARCHAR,
	firstname VARCHAR,
	lastname VARCHAR
);