import mysql.connector
import os
from config import Config


class DatabaseConnection:
    _connection = None

    @classmethod
    def get_connection(cls):
        """
        Devuelve una conexión válida.
        Si no existe o está caída, se crea nuevamente.
        """
        if cls._connection is None or not cls._connection.is_connected():

            connection_config = {
                "host": Config.DB_HOST,
                "user": Config.DB_USER,
                "port": int(Config.DB_PORT),
                "password": Config.DB_PASSWORD,
                "database": Config.DB_NAME,
            }

            # 👉 SSL solo si está configurado (Aiven / producción)
            ssl_ca_path = os.getenv("DB_SSL_CA")

            if ssl_ca_path:
                connection_config.update({
                    "ssl_ca": ssl_ca_path,
                    "ssl_verify_cert": True
                })

            cls._connection = mysql.connector.connect(**connection_config)

        return cls._connection

    @classmethod
    def execute_query(cls, query, params=None):
        connection = cls.get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(query, params)
            connection.commit()
            return cursor.lastrowid if query.strip().upper().startswith("INSERT") else cursor.rowcount
        except mysql.connector.Error as e:
            print(f"Error executing query: {e}")
            return 0
        finally:
            if cursor is not None:
                cursor.close()

    @classmethod
    def fetch_one(cls, query, params=None):
        connection = cls.get_connection()
        cursor = None
        try:
            cursor = connection.cursor(buffered=True)
            cursor.execute(query, params)
            return cursor.fetchone()
        except mysql.connector.Error as e:
            print(f"Error executing query: {e}")
            return None
        finally:
            if cursor is not None:
                cursor.close()

    @classmethod
    def fetch_all(cls, query, params=None):
        connection = cls.get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(query, params)
            return cursor.fetchall()
        except mysql.connector.Error as e:
            print(f"Error executing query: {e}")
            return None
        finally:
            if cursor is not None:
                cursor.close()

    @classmethod
    def close_connection(cls):
        """
        Cierra explícitamente la conexión (opcional).
        """
        if cls._connection is not None:
            try:
                cls._connection.close()
            except mysql.connector.Error as e:
                print(f"Error cerrando conexión: {e}")
            finally:
                cls._connection = None
