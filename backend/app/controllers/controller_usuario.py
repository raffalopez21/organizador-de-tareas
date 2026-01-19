from flask import request, jsonify
from app.models.models_usuario import Usuario

class UsuarioController:

    @staticmethod
    def get_usuarios():
        try:
            usuarios = Usuario.get_all()
            return jsonify([u.to_dict() for u in usuarios])
        except Exception as e:
            print(f"Error al obtener usuarios: {e}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def add_usuario():
        try:
            data = request.get_json()
            usuario = Usuario(
                nombre_usuario=data["nombre_usuario"],
                email=data["email"],
                contrasena=data["contrasena"]
            )
            usuario_id = Usuario.create(usuario)
            usuario.id = usuario_id
            return jsonify(usuario.to_dict()), 201
        except Exception as e:
            print(f"Error al añadir usuario: {e}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_usuario(usuario_id):
        try:
            data = request.get_json()
            usuario = Usuario(
                id=usuario_id,
                nombre_usuario=data["nombre_usuario"],
                email=data["email"],
                contrasena=data["contrasena"]
            )
            Usuario.update(usuario)
            return jsonify(usuario.to_dict())
        except Exception as e:
            print(f"Error al actualizar usuario: {e}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_usuario(usuario_id):
        try:
            Usuario.delete(usuario_id)
            return jsonify({"message": "Usuario eliminado"})
        except Exception as e:
            print(f"Error al eliminar usuario: {e}")
            return jsonify({"error": str(e)}), 500
