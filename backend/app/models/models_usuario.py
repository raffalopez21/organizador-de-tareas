from database.database_connection import DatabaseConnection

class Usuario:
    def __init__(self, id=None, nombre_usuario=None, email=None, contrasena=None):
        self.id = id
        self.nombre_usuario = nombre_usuario
        self.email = email
        self.contrasena = contrasena

    @classmethod
    def get_by_id(cls, usuario_id):
        query = "SELECT id, nombre_usuario, email, contrasena FROM usuarios WHERE id = %s"
        result = DatabaseConnection.fetch_one(query, (usuario_id,))
        if result:
            return cls(*result)
        return None

    @classmethod
    def get_all(cls):
        query = "SELECT id, nombre_usuario, email, contrasena FROM usuarios"
        results = DatabaseConnection.fetch_all(query)
        return [cls(*row) for row in results]

    @classmethod
    def create(cls, usuario):
        query = """
            INSERT INTO usuarios (nombre_usuario, email, contrasena)
            VALUES (%s, %s, %s)
            RETURNING id
        """
        params = (usuario.nombre_usuario, usuario.email, usuario.contrasena)
        return DatabaseConnection.execute_query(query, params)

    @classmethod
    def update(cls, usuario):
        query = """
            UPDATE usuarios SET nombre_usuario = %s, email = %s, contrasena = %s
            WHERE id = %s
        """
        params = (usuario.nombre_usuario, usuario.email, usuario.contrasena, usuario.id)
        DatabaseConnection.execute_query(query, params)

    @classmethod
    def delete(cls, usuario_id):
        query = "DELETE FROM usuarios WHERE id = %s"
        DatabaseConnection.execute_query(query, (usuario_id,))

    def to_dict(self):
        return {
            "id": self.id,
            "nombre_usuario": self.nombre_usuario,
            "email": self.email
        }
