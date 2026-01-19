from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from config import Config

# Importar blueprints
from app.routes.routes_tarea import tarea_bp

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurar CORS para permitir todas las origines en desarrollo
    CORS(app)
    
    # Para evitar redirecciones 308, configurar strict_slashes=False
    app.url_map.strict_slashes = False

    # Registrar blueprints con prefijo /api
    app.register_blueprint(tarea_bp, url_prefix="/api/tareas")

    @app.route('/api/health')
    def health():
        return {"status": "ok"}, 200

    return app