from flask import request, jsonify
from datetime import datetime
from app.models.models_tarea import Tarea

class TareaController:

    @staticmethod
    def get_tareas():
        tareas = Tarea.get_all()
        return jsonify([t.to_dict() for t in tareas])

    @staticmethod
    def add_tarea():
        data = request.get_json()
        if not data or 'titulo' not in data:
            return jsonify({"error": "Faltan campos obligatorios (titulo)"}), 400

        status = "completada" if data.get("completada") else data.get("status", "pendiente")

        fecha_raw = data.get("fecha")
        fecha_db = None
        if fecha_raw:
            try:
                # Manejar fecha en formato local sin conversión de timezone
                # Formato esperado: YYYY-MM-DDTHH:mm:ss o YYYY-MM-DDTHH:mm
                fecha_str = fecha_raw.replace('Z', '').replace('+00:00', '')
                if 'T' in fecha_str:
                    # Es formato datetime
                    fecha_db = datetime.fromisoformat(fecha_str).strftime('%Y-%m-%d %H:%M:%S')
                else:
                    # Es solo fecha
                    fecha_db = fecha_str
            except Exception as e:
                print(f"Error parsing date: {e}")
                fecha_db = None

        tarea = Tarea(
            titulo=data["titulo"],
            descripcion=data.get("descripcion", ""),
            status=status,
            fecha=fecha_db,
            usuario_id=1 # Default user ID
        )
        tarea_id = Tarea.create(tarea)
        tarea.id = tarea_id
        return jsonify(tarea.to_dict()), 201

    @staticmethod
    def update_tarea(tarea_id):
        data = request.get_json()
        status = "completada" if data.get("completada") else data.get("status", "pendiente")

        fecha_raw = data.get("fecha")
        fecha_db = None
        if fecha_raw:
            try:
                # Manejar fecha en formato local sin conversión de timezone
                # Formato esperado: YYYY-MM-DDTHH:mm:ss o YYYY-MM-DDTHH:mm
                fecha_str = fecha_raw.replace('Z', '').replace('+00:00', '')
                if 'T' in fecha_str:
                    # Es formato datetime
                    fecha_db = datetime.fromisoformat(fecha_str).strftime('%Y-%m-%d %H:%M:%S')
                else:
                    # Es solo fecha
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
            usuario_id=1 # Default user ID
        )
        Tarea.update(tarea)
        return jsonify(tarea.to_dict())

    @staticmethod
    def delete_tarea(tarea_id):
        Tarea.delete(tarea_id)
        return jsonify({"message": "Tarea eliminada"})
