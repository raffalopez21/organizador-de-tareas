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

    def to_dict(self):
        return {
            "id": self.id,
            "nombre_usuario": self.nombre_usuario,
            "email": self.email
        }
