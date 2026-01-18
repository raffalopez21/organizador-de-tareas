from flask import request, jsonify
from app.models.models_proyecto import Proyecto

class ProyectoController:

    @staticmethod
    def get_proyectos():
        proyectos = Proyecto.get_all()
        return jsonify([p.to_dict() for p in proyectos])

    @staticmethod
    def add_proyecto():
        data = request.get_json()
        proyecto = Proyecto(
            titulo=data["titulo"],
            descripcion=data.get("descripcion", ""),
            usuario_id=data["usuario_id"]
        )
        proyecto_id = Proyecto.create(proyecto)
        proyecto.id = proyecto_id
        return jsonify(proyecto.to_dict()), 201

    @staticmethod
    def update_proyecto(proyecto_id):
        data = request.get_json()
        proyecto = Proyecto(
            id=proyecto_id,
            titulo=data["titulo"],
            descripcion=data["descripcion"],
            usuario_id=data["usuario_id"]
        )
        Proyecto.update(proyecto)
        return jsonify(proyecto.to_dict())

    @staticmethod
    def delete_proyecto(proyecto_id):
        Proyecto.delete(proyecto_id)
        return jsonify({"message": "Proyecto eliminado"})
