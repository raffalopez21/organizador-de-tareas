from flask import Blueprint, request, jsonify
from app.models.models_usuario import Usuario
from app import db

usuario_bp = Blueprint('usuario', __name__)

@usuario_bp.route('/usuarios', methods=['GET'])
def get_usuarios():
    """Get all users from the database."""
    usuarios = Usuario.query.all()
    return jsonify([usuario.to_dict() for usuario in usuarios])

@usuario_bp.route('/usuarios', methods=['POST'])
def add_usuario():
    """Add a new user to the database."""
    data = request.get_json()
    nuevo_usuario = Usuario(
        nombre_usuario=data['nombre_usuario'],
        email=data['email'],
        contrasena=data['contrasena']
    )
    db.session.add(nuevo_usuario)
    db.session.commit()
    return jsonify(nuevo_usuario.to_dict()), 201

@usuario_bp.route('/usuarios/<int:usuario_id>', methods=['PUT'])
def update_usuario(usuario_id):
    """Update an existing user in the database."""
    usuario = Usuario.query.get_or_404(usuario_id)
    data = request.get_json()
    usuario.nombre_usuario = data.get('nombre_usuario', usuario.nombre_usuario)
    usuario.email = data.get('email', usuario.email)
    usuario.contrasena = data.get('contrasena', usuario.contrasena)
    db.session.commit()
    return jsonify(usuario.to_dict())

@usuario_bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
def delete_usuario(usuario_id):
    """Delete a user from the database."""
    usuario = Usuario.query.get_or_404(usuario_id)
    db.session.delete(usuario)
    db.session.commit()
    return '', 204