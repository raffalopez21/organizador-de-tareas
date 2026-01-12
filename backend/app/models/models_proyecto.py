from ...database import DatabaseConnection 

class Proyecto:
    def __init__(self, id=None, titulo=None, descripcion=None, usuario_id=None):
        self.id = id
        self.titulo = titulo
        self.descripcion = descripcion
        self.usuario_id = usuario_id

    @classmethod
    def create_proyecto(cls, proyecto):
        query = """
        INSERT INTO proyectos (titulo, descripcion, usuario_id)
        VALUES (%s, %s, %s)
        """
        params = (
            proyecto.titulo,
            proyecto.descripcion,
            proyecto.usuario_id
        )
        DatabaseConnection.execute_query(query, params)

    @classmethod
    def get_proyecto_by_id(cls, proyecto_id):
        query = "SELECT * FROM proyectos WHERE id = %s"
        params = (proyecto_id,)
        result = DatabaseConnection.fetch_one(query, params)
        if result:
            return cls(*result)
        return None

    @classmethod
    def get_all_proyectos(cls):
        query = "SELECT * FROM proyectos"
        results = DatabaseConnection.fetch_all(query)
        return [cls(*result) for result in results]

    @classmethod
    def update_proyecto(cls, proyecto):
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
    def delete_proyecto(cls, proyecto_id):
        query = "DELETE FROM proyectos WHERE id = %s"
        params = (proyecto_id,)
        DatabaseConnection.execute_query(query, params)