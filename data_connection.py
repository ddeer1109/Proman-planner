# import csv
# import os
import pathlib

# Creates a decorator to handle the database connection/cursor opening/closing.
# Creates the cursor with RealDictCursor, thus it returns real dictionaries, where the column names are the keys.
import os

import psycopg2
import psycopg2.extras

UPLOADED_IMAGES_FILE_PATH = pathlib.Path(f"{pathlib.Path(__file__).parent.absolute()}/static/images")


def get_connection_string():
    # setup connection string
    # to do this, please define these environment variables first
    # user_name = os.environ.get('PSQL_USER_NAME')
    # password = os.environ.get('PSQL_PASSWORD')
    # host = os.environ.get('PSQL_HOST')
    # database_name = os.environ.get('PSQL_DB_NAME')
    #
    # env_variables_defined = user_name and password and host and database_name
    #
    # if env_variables_defined:
        # this string describes all info for psycopg2 to connect to the database
    DATABASE_URL = os.environ.get('DATABASE_URL')
    return DATABASE_URL
    # else:
    #     raise KeyError('Some necessary environment variable(s) are not defined')


def open_database():
    try:
        connection_string = get_connection_string()
        connection = psycopg2.connect(connection_string)
        connection.autocommit = True
    except psycopg2.DatabaseError as exception:
        print('Database connection problem')
        raise exception
    return connection


def connection_handler(function):
    def wrapper(*args, **kwargs):
        connection = open_database()
        # we set the cursor_factory parameter to return with a RealDictCursor cursor (cursor which provide dictionaries)
        dict_cur = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        ret_value = function(dict_cur, *args, **kwargs)
        dict_cur.close()
        connection.close()
        return ret_value

    return wrapper

