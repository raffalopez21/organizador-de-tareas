from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from config import Config

from app.routes.routes_usuario import usuario_bp
from app.routes.routes_proyecto import proyecto_bp
from app.routes.routes_tarea import tarea_bp

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    app.register_blueprint(usuario_bp, url_prefix="/usuarios")
    app.register_blueprint(proyecto_bp, url_prefix="/proyectos")
    app.register_blueprint(tarea_bp, url_prefix="/tareas")

    return app
