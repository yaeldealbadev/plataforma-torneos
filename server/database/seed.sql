-- =====================================================================
--  SEED  ·  Plataforma de Videojuegos / Torneos
--  Agrega 1 admin + 2 usuarios + 5 juegos.
--  Alineado a la estructura real: users(username, email, password, role)
--  y games(title, genre, platform, description, image_url).
--
--  Cómo correrlo (con XAMPP arriba):
--    mysql -u root plataforma_torneos < server/database/seed.sql
--
--  Contraseñas (texto plano, para anotar en el PDF):
--    admin@torneos.com     -> Admin123!
--    jugador1@torneos.com  -> Jugador123!
--    jugador2@torneos.com  -> Jugador456!
--  (Los valores de password son hashes bcrypt reales y verificables.)
-- =====================================================================

USE plataforma_torneos;

INSERT INTO users (username, email, password, role) VALUES
('Administrador', 'admin@torneos.com',    '$2b$10$giRL8ku2JJzxL5E.SoKgK.0cNnTKYwHUAsvBD95Tiolpbnkjys3Eq', 'admin'),
('Jugador Uno',   'jugador1@torneos.com', '$2b$10$gK2UqYfLmIuoY9j3SyWS7.b5Dc1.tpAcQrZZeeVkmUHASLgEC1sKK', 'user'),
('Jugador Dos',   'jugador2@torneos.com', '$2b$10$YBWFuLCDvD6xMviuRf6tZuqLaL6l0HjVmf755vYuydnJ5VVfCCTDq', 'user');

INSERT INTO games (title, genre, platform, description, image_url) VALUES
('Valorant',          'FPS Táctico', 'PC',             'Shooter 5v5 basado en agentes con habilidades.', 'https://picsum.photos/seed/valorant/600/400'),
('League of Legends', 'MOBA',        'PC',             'Arena de batalla multijugador 5v5.',             'https://picsum.photos/seed/lol/600/400'),
('Counter-Strike 2',  'FPS Táctico', 'PC',             'Shooter competitivo por equipos.',               'https://picsum.photos/seed/cs2/600/400'),
('Rocket League',     'Deportes',    'Multiplataforma','Fútbol con autos a propulsión.',                 'https://picsum.photos/seed/rocket/600/400'),
('Street Fighter 6',  'Peleas',      'Consola/PC',     'Juego de pelea 1v1 clásico.',                    'https://picsum.photos/seed/sf6/600/400');
