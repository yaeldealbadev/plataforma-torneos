-- =====================================================================
--  PLATAFORMA DE VIDEOJUEGOS / TORNEOS  -  Base de datos MySQL
--  Mini-Proyecto Final  ·  React + Node.js + MySQL  ·  UAA  ·  Junio 2026
--  Equipo: Carlos · Yael · Raúl
-- =====================================================================






CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE games (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  genre       VARCHAR(80),
  platform    VARCHAR(80),
  description TEXT,
  image_url   VARCHAR(500),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE tournaments (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(150) NOT NULL,
  game_id           INT NOT NULL,
  description       TEXT,
  start_date        DATETIME NOT NULL,
  max_participants  INT NOT NULL DEFAULT 16,
  prize             VARCHAR(150),
  status            ENUM('open','in_progress','finished') NOT NULL DEFAULT 'open',
  created_by        INT,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tournament_game
    FOREIGN KEY (game_id)    REFERENCES games(id)  ON DELETE CASCADE,
  CONSTRAINT fk_tournament_creator
    FOREIGN KEY (created_by) REFERENCES users(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE registrations (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  tournament_id  INT NOT NULL,
  status         ENUM('registered','cancelled') NOT NULL DEFAULT 'registered',
  registered_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reg_user
    FOREIGN KEY (user_id)       REFERENCES users(id)        ON DELETE CASCADE,
  CONSTRAINT fk_reg_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)  ON DELETE CASCADE,
  CONSTRAINT uq_user_tournament UNIQUE (user_id, tournament_id)
) ENGINE=InnoDB;

CREATE INDEX idx_tournaments_game   ON tournaments(game_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_reg_user           ON registrations(user_id);
CREATE INDEX idx_reg_tournament     ON registrations(tournament_id);

-- DATOS SEMILLA
-- Contraseñas (texto plano, solo para anotar en el PDF):
--   admin@torneos.com -> Admin123!  ·  jugador1 -> Jugador123!  ·  jugador2 -> Jugador456!
INSERT INTO users (name, email, password, role) VALUES
('Administrador', 'admin@torneos.com',    '$2b$10$giRL8ku2JJzxL5E.SoKgK.0cNnTKYwHUAsvBD95Tiolpbnkjys3Eq', 'admin'),
('Jugador Uno',   'jugador1@torneos.com', '$2b$10$gK2UqYfLmIuoY9j3SyWS7.b5Dc1.tpAcQrZZeeVkmUHASLgEC1sKK', 'user'),
('Jugador Dos',   'jugador2@torneos.com', '$2b$10$YBWFuLCDvD6xMviuRf6tZuqLaL6l0HjVmf755vYuydnJ5VVfCCTDq', 'user');

INSERT INTO games (title, genre, platform, description, image_url) VALUES
('Valorant',          'FPS Táctico', 'PC',             'Shooter 5v5 basado en agentes con habilidades únicas.', 'https://picsum.photos/seed/valorant/600/400'),
('League of Legends', 'MOBA',        'PC',             'Arena de batalla multijugador 5v5.',                    'https://picsum.photos/seed/lol/600/400'),
('Counter-Strike 2',  'FPS Táctico', 'PC',             'Shooter competitivo por equipos.',                      'https://picsum.photos/seed/cs2/600/400'),
('Rocket League',     'Deportes',    'Multiplataforma','Fútbol con autos a propulsión.',                        'https://picsum.photos/seed/rocket/600/400'),
('Street Fighter 6',  'Peleas',      'Consola/PC',     'Juego de pelea 1v1 clásico.',                           'https://picsum.photos/seed/sf6/600/400');

INSERT INTO tournaments (name, game_id, description, start_date, max_participants, prize, status, created_by) VALUES
('Copa Valorant Primavera', 1, 'Torneo 5v5 eliminación directa.', '2026-07-10 17:00:00', 16, '$5,000 MXN',  'open',        1),
('LoL Summer Clash',        2, 'Liga de temporada, formato suizo.','2026-07-20 16:00:00', 32, '$8,000 MXN',  'open',        1),
('CS2 Aguascalientes Open', 3, 'Torneo presencial-online mixto.',  '2026-06-28 18:00:00', 16, 'Periféricos', 'in_progress', 1),
('Rocket League 2v2',       4, 'Duplas, doble eliminación.',       '2026-08-05 19:00:00',  8, '$2,000 MXN',  'open',        1),
('SF6 First to Win',        5, 'Bracket 1v1 first-to-3.',          '2026-05-30 15:00:00', 16, 'Trofeo',      'finished',    1);

INSERT INTO registrations (user_id, tournament_id, status) VALUES
(2, 1, 'registered'),
(2, 2, 'registered'),
(3, 1, 'registered'),
(3, 3, 'registered'),
(2, 5, 'cancelled');
