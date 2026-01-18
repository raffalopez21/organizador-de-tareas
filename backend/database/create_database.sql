CREATE DATABASE IF NOT EXISTS organizer_de_tareas;
USE organizer_de_tareas;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT,
  nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS tareas (
  id INT AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  status ENUM('pendiente', 'completada', 'pospuesta') DEFAULT 'pendiente',
  fecha DATETIME,
  usuario_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar un usuario por defecto para que las tareas funcionen inicialmente
INSERT IGNORE INTO usuarios (id, nombre_usuario, email, contrasena) 
VALUES (1, 'usuario_principal', 'admin@example.com', 'admin123');
