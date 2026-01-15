from flask import Blueprint
from app.controllers.controller_usuario import UsuarioController

usuario_bp = Blueprint('usuario_bp', __name__)

usuario_bp.route('/usuarios', methods=['GET'])(UsuarioController.get_usuarios)
usuario_bp.route('/usuarios', methods=['POST'])(UsuarioController.add_usuario)
usuario_bp.route('/usuarios/<int:usuario_id>', methods=['PUT'])(UsuarioController.update_usuario)
usuario_bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])(UsuarioController.delete_usuario)