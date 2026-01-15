from flask import request, jsonify
from database.database_connection import DatabaseConnection

class TareaController:

    @staticmethod
    def get_tareas():
        query = "SELECT * FROM tareas"
        rows = DatabaseConnection.fetch_all(query)

        tareas = []
        for row in rows:
            tareas.append({
                "id": row[0],
                "titulo": row[1],
                "descripcion": row[2],
                "status": row[3],
                "fecha_recordatorio": row[4],
                "usuario_id": row[5],
                "proyecto_id": row[6]
            })

        return jsonify(tareas)

    @staticmethod
    def add_tarea():
        data = request.get_json()

        query = """
            INSERT INTO tareas 
            (titulo, descripcion, status, fecha_recordatorio, usuario_id, proyecto_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        params = (
            data["titulo"],
            data.get("descripcion", ""),
            data.get("status", "pendiente"),
            data.get("fecha_recordatorio"),
            data["usuario_id"],
            data.get("proyecto_id")
        )

        DatabaseConnection.execute_query(query, params)

        return jsonify({"message": "Tarea creada"}), 201

    @staticmethod
    def update_tarea(tarea_id):
        data = request.get_json()

        query = """
            UPDATE tareas SET
            titulo=%s,
            descripcion=%s,
            status=%s,
            fecha_recordatorio=%s,
            usuario_id=%s,
            proyecto_id=%s
            WHERE id=%s
        """

        params = (
            data["titulo"],
            data["descripcion"],
            data["status"],
            data["fecha_recordatorio"],
            data["usuario_id"],
            data["proyecto_id"],
            tarea_id
        )

        DatabaseConnection.execute_query(query, params)
        return jsonify({"message": "Tarea actualizada"})

    @staticmethod
    def delete_tarea(tarea_id):
        query = "DELETE FROM tareas WHERE id = %s"
        DatabaseConnection.execute_query(query, (tarea_id,))
        return "", 204
