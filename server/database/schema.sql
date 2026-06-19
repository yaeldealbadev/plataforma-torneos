CREATE DATABASE IF NOT EXISTS plataforma_torneos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plataforma_torneos;

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)      NOT NULL,
  email       VARCHAR(255)     NOT NULL UNIQUE,
  password    VARCHAR(255)     NOT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(150)  NOT NULL,
  genre       VARCHAR(100),
  platform    VARCHAR(100),
  description TEXT,
  image_url   VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS tournaments (
  id          INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  game_id     INT UNSIGNED     NOT NULL,
  name        VARCHAR(150)     NOT NULL,
  description TEXT,
  status      ENUM('upcoming','open','ongoing','finished') NOT NULL DEFAULT 'upcoming',
  max_players SMALLINT UNSIGNED NOT NULL DEFAULT 16,
  starts_at   DATETIME,
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS registrations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  tournament_id INT UNSIGNED NOT NULL,
  status        ENUM('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_tournament (user_id, tournament_id),
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);
