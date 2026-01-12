from ...database import DatabaseConnection 

class Tareas:
    def __init__(self, id=None, titulo=None, descripcion=None, status=None, fecha_recordatorio=None, usuario_id=None, proyecto_id=None):
        self.id = id
        self.titulo = titulo
        self.descripcion = descripcion
        self.status = status
        self.fecha_recordatorio = fecha_recordatorio
        self.usuario_id = usuario_id
        self.proyecto_id = proyecto_id

    @classmethod
    def create_tarea(cls, tarea):
        query = """
        INSERT INTO tareas (titulo, descripcion, status, fecha_recordatorio, usuario_id, proyecto_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (
            tarea.titulo,
            tarea.descripcion,
            tarea.status,
            tarea.fecha_recordatorio,
            tarea.usuario_id,
            tarea.proyecto_id
        )
        DatabaseConnection.execute_query(query, params)

    @classmethod
    def get_tarea_by_id(cls, tarea_id):
        query = "SELECT * FROM tareas WHERE id = %s"
        params = (tarea_id,)
        result = DatabaseConnection.fetch_one(query, params)
        if result:
            return cls(*result)
        return None

    @classmethod
    def get_all_tareas(cls):
        query = "SELECT * FROM tareas"
        results = DatabaseConnection.fetch_all(query)
        return [cls(*result) for result in results]

    @classmethod
    def update_tarea(cls, tarea):
        query = """
        UPDATE tareas
        SET titulo = %s, descripcion = %s, status = %s, fecha_recordatorio = %s, usuario_id = %s, proyecto_id = %s
        WHERE id = %s
        """
        params = (
            tarea.titulo,
            tarea.descripcion,
            tarea.status,
            tarea.fecha_recordatorio,
            tarea.usuario_id,
            tarea.proyecto_id,
            tarea.id
        )
        DatabaseConnection.execute_query(query, params)

    @classmethod
    def delete_tarea(cls, tarea_id):
        query = "DELETE FROM tareas WHERE id = %s"
        params = (tarea_id,)
        DatabaseConnection.execute_query(query, params)