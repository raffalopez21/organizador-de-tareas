from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
  
db = SQLAlchemy()

def init_app():
    """Crea y configura la aplicación Flask"""
      
    app = Flask(__name__, static_folder = Config.STATIC_FOLDER, template_folder = Config.TEMPLATE_FOLDER)
      
    app.config.from_object(Config)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Raffa_2110*@localhost/organizer_de_tareas'
    db.init_app(app)
  
    # Register blueprints
    from backend.app.controllers.controller_tarea import tarea_bp
    from backend.app.controllers.controller_usuario import usuario_bp
    from backend.app.controllers.controller_proyecto import proyecto_bp
    app.register_blueprint(tarea_bp, url_prefix='/api')
    app.register_blueprint(usuario_bp, url_prefix='/api')
    app.register_blueprint(proyecto_bp, url_prefix='/api')
    
    return app