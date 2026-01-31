from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from config import Config

# Importar blueprints
from app.routes.routes_tarea import tarea_bp
from app.routes.routes_proyecto import proyecto_bp
from app.routes.routes_usuario import usuario_bp

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurar CORS de forma robusta
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
            "max_age": 3600
        }
    })
    
    @app.after_request
    def handle_cors(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Access-Control-Allow-Origin"
        return response

    # Para evitar redirecciones 308, configurar strict_slashes=False
    app.url_map.strict_slashes = False

    # Registrar blueprints con prefijo /api
    app.register_blueprint(tarea_bp, url_prefix="/api/tareas")
    app.register_blueprint(proyecto_bp, url_prefix="/api/proyectos")
    app.register_blueprint(usuario_bp, url_prefix="/api/usuarios")

    @app.route('/')
    def index():
        return {"message": "Organizador de Tareas API is running"}, 200

    @app.route('/api/health')
    def health():
        return {"status": "ok"}, 200

    return app