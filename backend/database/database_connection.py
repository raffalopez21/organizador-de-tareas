import psycopg2
from psycopg2.extras import RealDictCursor
import os
from config import Config


class DatabaseConnection:
    _connection = None

    @classmethod
    def get_connection(cls):
        """
        Devuelve una conexión válida a PostgreSQL.
        """
        if cls._connection is None or cls._connection.closed != 0:
            if Config.DATABASE_URL:
                cls._connection = psycopg2.connect(Config.DATABASE_URL)
            else:
                cls._connection = psycopg2.connect(
                    host=Config.DB_HOST,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    port=Config.DB_PORT,
                    database=Config.DB_NAME
                )
        return cls._connection

    @classmethod
    def execute_query(cls, query, params=None):
        cursor = None
        try:
            connection = cls.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, params)
            
            result = None
            if query.strip().upper().startswith("INSERT") and "RETURNING" in query.upper():
                result = cursor.fetchone()[0]
            else:
                result = cursor.rowcount
                
            connection.commit()
            return result
        except Exception as e:
            if cls._connection:
                cls._connection.rollback()
            print(f"Error executing query: {e}")
            raise e
        finally:
            if cursor is not None:
                cursor.close()

    @classmethod
    def fetch_one(cls, query, params=None):
        cursor = None
        try:
            connection = cls.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, params)
            return cursor.fetchone()
        except Exception as e:
            print(f"Error executing query: {e}")
            raise e
        finally:
            if cursor is not None:
                cursor.close()

    @classmethod
    def fetch_all(cls, query, params=None):
        cursor = None
        try:
            connection = cls.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, params)
            return cursor.fetchall()
        except Exception as e:
            print(f"Error executing query: {e}")
            raise e
        finally:
            if cursor is not None:
                cursor.close()

    @classmethod
    def close_connection(cls):
        if cls._connection is not None:
            try:
                cls._connection.close()
            except Exception as e:
                print(f"Error cerrando conexión: {e}")
            finally:
                cls._connection = None
