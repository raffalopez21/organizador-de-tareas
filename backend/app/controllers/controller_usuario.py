from flask import request, jsonify
from app.models.models_usuario import Usuario

class UsuarioController:

    @staticmethod
    def get_usuarios():
        usuarios = Usuario.get_all()
        return jsonify([u.to_dict() for u in usuarios])

    @staticmethod
    def add_usuario():
        data = request.get_json()
        usuario = Usuario(
            nombre_usuario=data["nombre_usuario"],
            email=data["email"],
            contrasena=data["contrasena"]
        )
        usuario_id = Usuario.create(usuario)
        usuario.id = usuario_id
        return jsonify(usuario.to_dict()), 201

    @staticmethod
    def update_usuario(usuario_id):
        data = request.get_json()
        usuario = Usuario(
            id=usuario_id,
            nombre_usuario=data["nombre_usuario"],
            email=data["email"],
            contrasena=data["contrasena"]
        )
        Usuario.update(usuario)
        return jsonify(usuario.to_dict())

    @staticmethod
    def delete_usuario(usuario_id):
        Usuario.delete(usuario_id)
        return jsonify({"message": "Usuario eliminado"})
