# controllers/usuario_controller.py
from flask import request, jsonify
from app.models.models_usuario import Usuario
from app import db

class UsuarioController:
    @staticmethod
    def get_usuarios():
        usuarios = Usuario.query.all()
        return jsonify([usuario.to_dict() for usuario in usuarios])

    @staticmethod
    def add_usuario():
        data = request.get_json()
        nuevo_usuario = Usuario(
            nombre_usuario=data['nombre_usuario'],
            email=data['email'],
            contrasena=data['contrasena']
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify(nuevo_usuario.to_dict()), 201

    @staticmethod
    def update_usuario(usuario_id):
        usuario = Usuario.query.get_or_404(usuario_id)
        data = request.get_json()
        usuario.nombre_usuario = data.get('nombre_usuario', usuario.nombre_usuario)
        usuario.email = data.get('email', usuario.email)
        usuario.contrasena = data.get('contrasena', usuario.contrasena)
        db.session.commit()
        return jsonify(usuario.to_dict())

    @staticmethod
    def delete_usuario(usuario_id):
        usuario = Usuario.query.get_or_404(usuario_id)
        db.session.delete(usuario)
        db.session.commit()
        return '', 204