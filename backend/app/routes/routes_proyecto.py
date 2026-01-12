from flask import Blueprint
from ..controllers.controller_proyecto import ProyectoController

proyecto_bp = Blueprint('proyecto_bp', __name__)

proyecto_bp.route('/proyectos', methods=['GET'])(ProyectoController.get_proyectos)
proyecto_bp.route('/proyectos', methods=['POST'])(ProyectoController.add_proyecto)
proyecto_bp.route('/proyectos/<int:proyecto_id>', methods=['PUT'])(ProyectoController.update_proyecto)
proyecto_bp.route('/proyectos/<int:proyecto_id>', methods=['DELETE'])(ProyectoController.delete_proyecto)