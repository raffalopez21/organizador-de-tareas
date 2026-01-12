# controllers/tarea_controller.py
from flask import request, jsonify
from app.models.models_tarea import Tarea
from app import db

class TareaController:
    @staticmethod
    def get_tareas():
        tareas = Tarea.query.all()
        return jsonify([tarea.to_dict() for tarea in tareas])

    @staticmethod
    def add_tarea():
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

    @staticmethod
    def update_tarea(tarea_id):
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

    @staticmethod
    def delete_tarea(tarea_id):
        tarea = Tarea.query.get_or_404(tarea_id)
        db.session.delete(tarea)
        db.session.commit()
        return '', 204