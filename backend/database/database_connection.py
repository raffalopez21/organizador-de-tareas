import psycopg2
from config import Config

class DatabaseConnection:

    @staticmethod
    def get_connection():
        if Config.DATABASE_URL:
            return psycopg2.connect(Config.DATABASE_URL)
        else:
            return psycopg2.connect(
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                port=Config.DB_PORT,
                database=Config.DB_NAME
            )

    @classmethod
    def execute_query(cls, query, params=None):
        conn = None
        cur = None
        try:
            conn = cls.get_connection()
            cur = conn.cursor()
            cur.execute(query, params)

            if query.strip().upper().startswith("INSERT") and "RETURNING" in query.upper():
                result = cur.fetchone()[0]
            else:
                result = cur.rowcount

            conn.commit()
            return result

        except Exception as e:
            if conn:
                conn.rollback()
            raise e

        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    @classmethod
    def fetch_one(cls, query, params=None):
        conn = None
        cur = None
        try:
            conn = cls.get_connection()
            cur = conn.cursor()
            cur.execute(query, params)
            return cur.fetchone()

        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    @classmethod
    def fetch_all(cls, query, params=None):
        conn = None
        cur = None
        try:
            conn = cls.get_connection()
            cur = conn.cursor()
            cur.execute(query, params)
            return cur.fetchall()

        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()
