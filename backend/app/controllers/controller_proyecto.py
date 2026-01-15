from flask import request, jsonify
from database.database_connection import DatabaseConnection

class ProyectoController:

    @staticmethod
    def get_proyectos():
        query = "SELECT * FROM proyectos"
        rows = DatabaseConnection.fetch_all(query)

        proyectos = []
        for row in rows:
            proyectos.append({
                "id": row[0],
                "titulo": row[1],
                "descripcion": row[2],
                "usuario_id": row[3]
            })

        return jsonify(proyectos)

    @staticmethod
    def add_proyecto():
        data = request.get_json()

        query = """
            INSERT INTO proyectos (titulo, descripcion, usuario_id)
            VALUES (%s, %s, %s)
        """

        params = (
            data["titulo"],
            data.get("descripcion", ""),
            data["usuario_id"]
        )

        DatabaseConnection.execute_query(query, params)

        return jsonify({"message": "Proyecto creado"}), 201

    @staticmethod
    def update_proyecto(proyecto_id):
        data = request.get_json()

        query = """
            UPDATE proyectos SET
            titulo = %s,
            descripcion = %s,
            usuario_id = %s
            WHERE id = %s
        """

        params = (
            data["titulo"],
            data["descripcion"],
            data["usuario_id"],
            proyecto_id
        )

        DatabaseConnection.execute_query(query, params)

        return jsonify({"message": "Proyecto actualizado"})

    @staticmethod
    def delete_proyecto(proyecto_id):
        query = "DELETE FROM proyectos WHERE id = %s"
        DatabaseConnection.execute_query(query, (proyecto_id,))
        return "", 204
