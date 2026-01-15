from flask import Blueprint
from app.controllers.controller_tarea import TareaController

tarea_bp = Blueprint('tarea_bp', __name__)

tarea_bp.route('/tareas', methods=['GET'])(TareaController.get_tareas)
tarea_bp.route('/tareas', methods=['POST'])(TareaController.add_tarea)
tarea_bp.route('/tareas/<int:tarea_id>', methods=['PUT'])(TareaController.update_tarea)
tarea_bp.route('/tareas/<int:tarea_id>', methods=['DELETE'])(TareaController.delete_tarea)