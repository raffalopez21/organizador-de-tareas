from flask import Blueprint, request, jsonify
from app.models.models_proyecto import Proyecto
from app import db

proyecto_bp = Blueprint('proyecto', __name__)

@proyecto_bp.route('/proyectos', methods=['GET'])
def get_proyectos():
    """Get all projects from the database."""
    proyectos = Proyecto.query.all()
    return jsonify([proyecto.to_dict() for proyecto in proyectos])

@proyecto_bp.route('/proyectos', methods=['POST'])
def add_proyecto():
    """Add a new project to the database."""
    data = request.get_json()
    nuevo_proyecto = Proyecto(
        titulo=data['titulo'],
        descripcion=data.get('descripcion', ''),
        usuario_id=data['usuario_id']
    )
    db.session.add(nuevo_proyecto)
    db.session.commit()
    return jsonify(nuevo_proyecto.to_dict()), 201

@proyecto_bp.route('/proyectos/<int:proyecto_id>', methods=['PUT'])
def update_proyecto(proyecto_id):
    """Update an existing project in the database."""
    proyecto = Proyecto.query.get_or_404(proyecto_id)
    data = request.get_json()
    proyecto.titulo = data.get('titulo', proyecto.titulo)
    proyecto.descripcion = data.get('descripcion', proyecto.descripcion)
    proyecto.usuario_id = data.get('usuario_id', proyecto.usuario_id)
    db.session.commit()
    return jsonify(proyecto.to_dict())

@proyecto_bp.route('/proyectos/<int:proyecto_id>', methods=['DELETE'])
def delete_proyecto(proyecto_id):
    """Delete a project from the database."""
    proyecto = Proyecto.query.get_or_404(proyecto_id)
    db.session.delete(proyecto)
    db.session.commit()
    return '', 204