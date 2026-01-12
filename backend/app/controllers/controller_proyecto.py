# controllers/proyecto_controller.py
from flask import request, jsonify
from app.models.models_proyecto import Proyecto
from app import db

class ProyectoController:
    @staticmethod
    def get_proyectos():
        proyectos = Proyecto.query.all()
        return jsonify([proyecto.to_dict() for proyecto in proyectos])

    @staticmethod
    def add_proyecto():
        data = request.get_json()
        nuevo_proyecto = Proyecto(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            usuario_id=data['usuario_id']
        )
        db.session.add(nuevo_proyecto)
        db.session.commit()
        return jsonify(nuevo_proyecto.to_dict()), 201

    @staticmethod
    def update_proyecto(proyecto_id):
        proyecto = Proyecto.query.get_or_404(proyecto_id)
        data = request.get_json()
        proyecto.titulo = data.get('titulo', proyecto.titulo)
        proyecto.descripcion = data.get('descripcion', proyecto.descripcion)
        proyecto.usuario_id = data.get('usuario_id', proyecto.usuario_id)
        db.session.commit()
        return jsonify(proyecto.to_dict())

    @staticmethod
    def delete_proyecto(proyecto_id):
        proyecto = Proyecto.query.get_or_404(proyecto_id)
        db.session.delete(proyecto)
        db.session.commit()
        return '', 204