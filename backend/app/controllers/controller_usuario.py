from flask import request, jsonify
from database.database_connection import DatabaseConnection

class UsuarioController:

    @staticmethod
    def get_usuarios():
        query = "SELECT id, nombre_usuario, email FROM usuarios"
        rows = DatabaseConnection.fetch_all(query)

        usuarios = []
        for row in rows:
            usuarios.append({
                "id": row[0],
                "nombre_usuario": row[1],
                "email": row[2]
            })

        return jsonify(usuarios)

    @staticmethod
    def add_usuario():
        data = request.get_json()

        query = """
            INSERT INTO usuarios (nombre_usuario, email, contrasena)
            VALUES (%s, %s, %s)
        """

        params = (
            data["nombre_usuario"],
            data["email"],
            data["contrasena"]
        )

        DatabaseConnection.execute_query(query, params)

        return jsonify({"message": "Usuario creado"}), 201

    @staticmethod
    def update_usuario(usuario_id):
        data = request.get_json()

        query = """
            UPDATE usuarios SET
            nombre_usuario = %s,
            email = %s,
            contrasena = %s
            WHERE id = %s
        """

        params = (
            data["nombre_usuario"],
            data["email"],
            data["contrasena"],
            usuario_id
        )

        DatabaseConnection.execute_query(query, params)

        return jsonify({"message": "Usuario actualizado"})

    @staticmethod
    def delete_usuario(usuario_id):
        query = "DELETE FROM usuarios WHERE id = %s"
        DatabaseConnection.execute_query(query, (usuario_id,))
        return "", 204
