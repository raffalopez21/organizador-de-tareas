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
                "fecha": row[4],
                "usuario_id": row[5],
                "proyecto_id": row[6]
            })

        return jsonify(tareas)

    @staticmethod
    def add_tarea():
        data = request.get_json()

        query = """
            INSERT INTO tareas 
            (titulo, descripcion, status, fecha, usuario_id, proyecto_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        # Mapear 'completada' del frontend a 'status' del backend
        status = "completada" if data.get("completada") else "pendiente"
        
        # Formatear fecha para MySQL (YYYY-MM-DD HH:MM:SS)
        fecha = data.get("fecha")
        if fecha:
            fecha = fecha.replace('T', ' ').replace('Z', '')

        params = (
            data["titulo"],
            data.get("descripcion", ""),
            status,
            fecha,
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
            fecha=%s,
            usuario_id=%s,
            proyecto_id=%s
            WHERE id=%s
        """

        # Mapear 'completada' del frontend a 'status' del backend
        status = "completada" if data.get("completada") else "pendiente"

        # Formatear fecha para MySQL (YYYY-MM-DD HH:MM:SS)
        fecha = data.get("fecha")
        if fecha:
            fecha = fecha.replace('T', ' ').replace('Z', '')

        params = (
            data["titulo"],
            data["descripcion"],
            status,
            fecha,
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
