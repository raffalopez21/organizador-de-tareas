from flask import Flask 
from config import Config 
 
def init_app(): 
    """Crea y configura la aplicación Flask""" 
     
    app = Flask(__name__, static_folder = Config.STATIC_FOLDER, templa
te_folder = Config.TEMPLATE_FOLDER) 
     
    app.config.from_object(Config) 
 
    # Un endpoint que dice 'Hola Mundo!' 
    @app.route('/') 
    def hello_world(): 
        return 'Hola Mundo!' 
    return app