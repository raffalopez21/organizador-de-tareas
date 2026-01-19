from app import create_app
import threading
import time
import urllib.request

app = create_app()

if __name__ == "__main__":
    app.run()
