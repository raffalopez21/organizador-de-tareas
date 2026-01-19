-- Tipos ENUM para PostgreSQL
DO $$ BEGIN
    CREATE TYPE status_tarea AS ENUM ('pendiente', 'completada', 'pospuesta');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS proyectos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tareas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  status status_tarea DEFAULT 'pendiente',
  fecha TIMESTAMP,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar un usuario por defecto
INSERT INTO usuarios (id, nombre_usuario, email, contrasena) 
VALUES (1, 'usuario_principal', 'admin@example.com', 'admin123')
ON CONFLICT (id) DO NOTHING;

-- Reiniciar la secuencia si insertamos manualmente el ID 1
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1));
