from app import create_app
import threading
import time
import urllib.request

app = create_app()

def keep_alive():
    """Hilo para evitar que Render entre en suspensión (14 min)"""
    url = "https://organizador-de-tareas-hgpd.onrender.com/api/health"
    while True:
        try:
            print("🚀 Enviando ping de Keep-Alive...")
            urllib.request.urlopen(url)
        except Exception as e:
            print(f"⚠️ Error en Keep-Alive: {e}")
        time.sleep(840) # 14 minutos (Render duerme a los 15)

if __name__ == "__main__":
    # Iniciar hilo de keep-alive solo en producción
    threading.Thread(target=keep_alive, daemon=True).start()
    app.run()
