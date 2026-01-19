from flask import request, jsonify
from datetime import datetime
from app.models.models_tarea import Tarea

class TareaController:

    @staticmethod
    def get_tareas():
        try:
            tareas = Tarea.get_all()
            return jsonify([t.to_dict() for t in tareas])
        except Exception as e:
            print(f"Error al obtener tareas: {e}")
            return jsonify({"error": f"Error al obtener tareas: {str(e)}"}), 500

    @staticmethod
    def add_tarea():
        try:
            data = request.get_json()
            if not data or 'titulo' not in data:
                return jsonify({"error": "Faltan campos obligatorios (titulo)"}), 400

            status = "completada" if data.get("completada") else data.get("status", "pendiente")

            fecha_raw = data.get("fecha")
            fecha_db = None
            if fecha_raw:
                try:
                    fecha_str = fecha_raw.replace('Z', '').replace('+00:00', '')
                    if 'T' in fecha_str:
                        fecha_db = datetime.fromisoformat(fecha_str).strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        fecha_db = fecha_str
                except Exception as e:
                    print(f"Error parsing date: {e}")
                    fecha_db = None

            tarea = Tarea(
                titulo=data["titulo"],
                descripcion=data.get("descripcion", ""),
                status=status,
                fecha=fecha_db,
                usuario_id=1
            )
            tarea_id = Tarea.create(tarea)
            tarea.id = tarea_id
            return jsonify(tarea.to_dict()), 201
        except Exception as e:
            print(f"Error al crear tarea: {e}")
            return jsonify({"error": f"Error al crear tarea: {str(e)}"}), 500

    @staticmethod
    def update_tarea(tarea_id):
        try:
            data = request.get_json()
            status = "completada" if data.get("completada") else data.get("status", "pendiente")

            fecha_raw = data.get("fecha")
            fecha_db = None
            if fecha_raw:
                try:
                    fecha_str = fecha_raw.replace('Z', '').replace('+00:00', '')
                    if 'T' in fecha_str:
                        fecha_db = datetime.fromisoformat(fecha_str).strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        fecha_db = fecha_str
                except Exception as e:
                    print(f"Error parsing date: {e}")
                    fecha_db = None

            tarea = Tarea(
                id=tarea_id,
                titulo=data.get("titulo"),
                descripcion=data.get("descripcion", ""),
                status=status,
                fecha=fecha_db,
                usuario_id=1
            )
            Tarea.update(tarea)
            return jsonify(tarea.to_dict())
        except Exception as e:
            print(f"Error al actualizar tarea: {e}")
            return jsonify({"error": f"Error al actualizar tarea: {str(e)}"}), 500

    @staticmethod
    def delete_tarea(tarea_id):
        try:
            Tarea.delete(tarea_id)
            return jsonify({"message": "Tarea eliminada"})
        except Exception as e:
            print(f"Error al eliminar tarea: {e}")
            return jsonify({"error": f"Error al eliminar tarea: {str(e)}"}), 500
