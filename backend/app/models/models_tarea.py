from database.database_connection import DatabaseConnection

class Tarea:
    def __init__(self, id=None, titulo=None, descripcion=None, status=None,
                 fecha=None, usuario_id=None):
        self.id = id
        self.titulo = titulo
        self.descripcion = descripcion
        self.status = status
        self.fecha = fecha
        self.usuario_id = usuario_id

    def to_dict(self):
        data = {
            "id": self.id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "status": self.status,
            "fecha": self.fecha.isoformat() if self.fecha and hasattr(self.fecha, 'isoformat') else self.fecha,
            "usuario_id": self.usuario_id,
            "completada": self.status == "completada"
        }
        return data

    @classmethod
    def create(cls, tarea):
        query = """
            INSERT INTO tareas
            (titulo, descripcion, status, fecha, usuario_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            tarea.titulo,
            tarea.descripcion,
            tarea.status,
            tarea.fecha,
            tarea.usuario_id
        )
        return DatabaseConnection.execute_query(query, params)

    @classmethod
    def get_all(cls):
        query = "SELECT id, titulo, descripcion, status, fecha, usuario_id FROM tareas"
        results = DatabaseConnection.fetch_all(query)
        return [cls(*row) for row in results]

    @classmethod
    def update(cls, tarea):
        query = """
            UPDATE tareas SET
            titulo = %s,
            descripcion = %s,
            status = %s,
            fecha = %s,
            usuario_id = %s
            WHERE id = %s
        """
        params = (
            tarea.titulo,
            tarea.descripcion,
            tarea.status,
            tarea.fecha,
            tarea.usuario_id,
            tarea.id
        )
        DatabaseConnection.execute_query(query, params)

    @classmethod
    def delete(cls, tarea_id):
        query = "DELETE FROM tareas WHERE id = %s"
        params = (tarea_id,)
        DatabaseConnection.execute_query(query, params)
