from flask import Blueprint
from app.controllers.controller_proyecto import ProyectoController

proyecto_bp = Blueprint('proyecto_bp', __name__)

proyecto_bp.route('', methods=['GET'])(ProyectoController.get_proyectos)
proyecto_bp.route('', methods=['POST'])(ProyectoController.add_proyecto)
proyecto_bp.route('/<int:proyecto_id>', methods=['PUT'])(ProyectoController.update_proyecto)
proyecto_bp.route('/<int:proyecto_id>', methods=['DELETE'])(ProyectoController.delete_proyecto)
