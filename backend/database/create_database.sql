CREATE DATABASE IF NOT EXISTS organizer_de_tareas;
USE organizer_de_tareas;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT,
  nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

INSERT IGNORE INTO usuarios (id, nombre_usuario, email, contrasena) 
VALUES (1, 'administrador', 'admin@example.com', 'admin123');

CREATE TABLE IF NOT EXISTS proyectos (
  id INT AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  usuario_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tareas (
  id INT AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  status ENUM('pendiente', 'completada', 'pospuesta') DEFAULT 'pendiente',
  fecha DATETIME,
  usuario_id INT,
  proyecto_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);
