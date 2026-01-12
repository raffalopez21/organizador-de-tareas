from flask import Blueprint, request, jsonify
from app.models.models_tarea import Tarea
from app import db

tarea_bp = Blueprint('tarea', __name__)

@tarea_bp.route('/tareas', methods=['GET'])
def get_tareas():
    """Get all tasks from the database."""
    tareas = Tarea.query.all()
    return jsonify([tarea.to_dict() for tarea in tareas])

@tarea_bp.route('/tareas', methods=['POST'])
def add_tarea():
    """Add a new task to the database."""
    data = request.get_json()
    nueva_tarea = Tarea(
        titulo=data['titulo'],
        descripcion=data.get('descripcion', ''),
        status=data.get('status', 'pendiente'),
        fecha_recordatorio=data.get('fecha_recordatorio'),
        usuario_id=data['usuario_id'],
        proyecto_id=data.get('proyecto_id')
    )
    db.session.add(nueva_tarea)
    db.session.commit()
    return jsonify(nueva_tarea.to_dict()), 201

@tarea_bp.route('/tareas/<int:tarea_id>', methods=['PUT'])
def update_tarea(tarea_id):
    """Update an existing task in the database."""
    tarea = Tarea.query.get_or_404(tarea_id)
    data = request.get_json()
    tarea.titulo = data.get('titulo', tarea.titulo)
    tarea.descripcion = data.get('descripcion', tarea.descripcion)
    tarea.status = data.get('status', tarea.status)
    tarea.fecha_recordatorio = data.get('fecha_recordatorio', tarea.fecha_recordatorio)
    tarea.usuario_id = data.get('usuario_id', tarea.usuario_id)
    tarea.proyecto_id = data.get('proyecto_id', tarea.proyecto_id)
    db.session.commit()
    return jsonify(tarea.to_dict())

@tarea_bp.route('/tareas/<int:tarea_id>', methods=['DELETE'])
def delete_tarea(tarea_id):
    """Delete a task from the database."""
    tarea = Tarea.query.get_or_404(tarea_id)
    db.session.delete(tarea)
    db.session.commit()
    return '', 204