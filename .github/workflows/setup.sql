CREATE DATABASE blog_platform;

\c blog_platform

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);
