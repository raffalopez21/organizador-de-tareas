from database.database_connection import DatabaseConnection

class Proyecto:
    def __init__(self, id=None, titulo=None, descripcion=None, usuario_id=None):
        self.id = id
        self.titulo = titulo
        self.descripcion = descripcion
        self.usuario_id = usuario_id

    def to_dict(self):
        return vars(self)

    @classmethod
    def create(cls, proyecto):
        query = """
            INSERT INTO proyectos (titulo, descripcion, usuario_id)
            VALUES (%s, %s, %s)
            RETURNING id
        """
        params = (
            proyecto.titulo,
            proyecto.descripcion,
            proyecto.usuario_id
        )
        return DatabaseConnection.execute_query(query, params)

    @classmethod
    def get_by_id(cls, proyecto_id):
        query = "SELECT * FROM proyectos WHERE id = %s"
        params = (proyecto_id,)
        result = DatabaseConnection.fetch_one(query, params)
        return cls(*result) if result else None

    @classmethod
    def get_all(cls):
        query = "SELECT * FROM proyectos"
        results = DatabaseConnection.fetch_all(query)
        return [cls(*row) for row in results]

    @classmethod
    def update(cls, proyecto):
        query = """
            UPDATE proyectos
            SET titulo = %s, descripcion = %s, usuario_id = %s
            WHERE id = %s
        """
        params = (
            proyecto.titulo,
            proyecto.descripcion,
            proyecto.usuario_id,
            proyecto.id
        )
        DatabaseConnection.execute_query(query, params)

    @classmethod
    def delete(cls, proyecto_id):
        query = "DELETE FROM proyectos WHERE id = %s"
        params = (proyecto_id,)
        DatabaseConnection.execute_query(query, params)
