import mysql.connector 
 
class DatabaseConnection: 
    _connection = None 
    @classmethod 
    def get_connection(cls): 
        if cls._connection is None: 
            cls._connection = mysql.connector.connect( 
                host='localhost', 
                user='root', 
                #port = "3306", 
                password='Raffa_2110*', 
                database='organizer_de_tareas' 
            ) 
        return cls._connection 
    
    @classmethod 
    def execute_query(cls, query, params=None): 
        cursor = cls.get_connection().cursor() 
        cursor.execute(query, params) 
        cls._connection.commit() 
        return cursor
    
    @classmethod 
    def fetch_one(cls, query, params=None): 
        cursor = cls.get_connection().cursor() 
        cursor.execute(query, params) 
        return cursor.fetchone() 
    
    @classmethod 
    def fetch_all(cls, query, params=None): 
        cursor = cls.get_connection().cursor() 
        cursor.execute(query, params) 
        return cursor.fetchall() 
    
    @classmethod 
    def close_connection(cls): 
        if cls._connection is not None: 
            cls._connection.close() 
            cls._connection = None 


'''conn = mysql.connector.connect(user='root', 
                               password='Raffa_2110*', 
                               host='localhost', 
                               database='sakila') 
 
film_id = 100 
consulta = """SELECT first_name, last_name 
              FROM actor 
              INNER JOIN film_actor 
              ON actor.actor_id = film_actor.actor_id 
              WHERE film_actor.film_id = %s""" 
 
cur = conn.cursor() 
cur.execute(consulta, (film_id,)) 
resultado = cur.fetchall() 
print(resultado)  # muestra una lista de tuplas con los datos 
conn.close() '''




