from database.database_connection import DatabaseConnection

class Usuario:
    def __init__(self, id=None, nombre_usuario=None, email=None, contrasena=None):
        self.id = id
        self.nombre_usuario = nombre_usuario
        self.email = email
        self.contrasena = contrasena

    @classmethod
    def create_usuario(cls, usuario):
        query = """
        INSERT INTO usuarios (nombre_usuario, email, contrasena)
        VALUES (%s, %s, %s)
        """
        params = (
            usuario.nombre_usuario,
            usuario.email,
            usuario.contrasena
        )
        DatabaseConnection.execute_query(query, params)

    @classmethod
    def get_usuario_by_id(cls, usuario_id):
        query = "SELECT * FROM usuarios WHERE id = %s"
        params = (usuario_id,)
        result = DatabaseConnection.fetch_one(query, params)
        if result:
            return cls(*result)
        return None

    @classmethod
    def get_all_usuarios(cls):
        query = "SELECT * FROM usuarios"
        results = DatabaseConnection.fetch_all(query)
        return [cls(*result) for result in results]

    @classmethod
    def update_usuario(cls, usuario):
        query = """
        UPDATE usuarios
        SET nombre_usuario = %s, email = %s, contrasena = %s
        WHERE id = %s
        """
        params = (
            usuario.nombre_usuario,
            usuario.email,
            usuario.contrasena,
            usuario.id
        )
        DatabaseConnection.execute_query(query, params)

    @classmethod
    def delete_usuario(cls, usuario_id):
        query = "DELETE FROM usuarios WHERE id = %s"
        params = (usuario_id,)
        DatabaseConnection.execute_query(query, params)