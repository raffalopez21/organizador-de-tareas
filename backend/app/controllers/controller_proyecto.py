from flask import request, jsonify
from app.models.models_proyecto import Proyecto

class ProyectoController:

    @staticmethod
    def get_proyectos():
        try:
            proyectos = Proyecto.get_all()
            return jsonify([p.to_dict() for p in proyectos])
        except Exception as e:
            print(f"Error al obtener proyectos: {e}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def add_proyecto():
        try:
            data = request.get_json()
            proyecto = Proyecto(
                titulo=data["titulo"],
                descripcion=data.get("descripcion", ""),
                usuario_id=data["usuario_id"]
            )
            proyecto_id = Proyecto.create(proyecto)
            proyecto.id = proyecto_id
            return jsonify(proyecto.to_dict()), 201
        except Exception as e:
            print(f"Error al añadir proyecto: {e}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_proyecto(proyecto_id):
        try:
            data = request.get_json()
            proyecto = Proyecto(
                id=proyecto_id,
                titulo=data["titulo"],
                descripcion=data["descripcion"],
                usuario_id=data["usuario_id"]
            )
            Proyecto.update(proyecto)
            return jsonify(proyecto.to_dict())
        except Exception as e:
            print(f"Error al actualizar proyecto: {e}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_proyecto(proyecto_id):
        try:
            Proyecto.delete(proyecto_id)
            return jsonify({"message": "Proyecto eliminado"})
        except Exception as e:
            print(f"Error al eliminar proyecto: {e}")
            return jsonify({"error": str(e)}), 500
