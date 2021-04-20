import data_connection
import csv
from psycopg2.extras import RealDictCursor

STATUSES_FILE = './data/statuses.csv'
BOARDS_FILE = './data/boards.csv'
CARDS_FILE = './data/cards.csv'

_cache = {}  # We store cached data in this dict to avoid multiple file readings


def _read_csv(file_name):
    """
    Reads content of a .csv file
    :param file_name: relative path to data file
    :return: OrderedDict
    """
    with open(file_name) as boards:
        rows = csv.DictReader(boards, delimiter=',', quotechar='"')
        formatted_data = []
        for row in rows:
            formatted_data.append(dict(row))
        return formatted_data


def _get_data(data_type, file, force):
    """
    Reads defined type of data from file or cache
    :param data_type: key where the data is stored in cache
    :param file: relative path to data file
    :param force: if set to True, cache will be ignored
    :return: OrderedDict
    """
    if force or data_type not in _cache:
        _cache[data_type] = _read_csv(file)
    return _cache[data_type]


def clear_cache():
    for k in list(_cache.keys()):
        _cache.pop(k)

#
# def get_statuses(force=False):
#     return _get_data('statuses', STATUSES_FILE, force)
@data_connection.connection_handler
def get_statuses(cursor: RealDictCursor):
    query = """
    SELECT * FROM status
    """
    cursor.execute(query)

    dictStatusesList = []
    for entry in cursor.fetchall():
        dictStatusesList.append(dict(entry))

    return dictStatusesList
#
# def get_boards(force=False):
#     return _get_data('boards', BOARDS_FILE, force)

@data_connection.connection_handler
def get_boards(cursor: RealDictCursor):
    query = f"""
    SELECT * FROM board
    """
    cursor.execute(query)

    dictBoardsList = []
    for entry in cursor.fetchall():
        dictBoardsList.append(dict(entry))

    return dictBoardsList


# def get_cards(force=False):
#     return _get_data('cards', CARDS_FILE, force)

@data_connection.connection_handler
def get_cards(cursor: RealDictCursor, board_id):
    query = f"""
        SELECT * FROM card
        WHERE board_id=%(board_id)s
        ORDER BY index;
        """
    cursor.execute(query, {'board_id': board_id})

    dictCardsList = []
    for entry in cursor.fetchall():
        dictCardsList.append(dict(entry))

    return dictCardsList

@data_connection.connection_handler
def get_board_statuses(cursor: RealDictCursor, board_id):
    query = f"""
            SELECT status.id as id, status.title as title FROM status
            INNER JOIN board_status
            ON board_status.status_id=status.id
            WHERE board_status.board_id=%(board_id)s;
            """
    cursor.execute(query, {'board_id': board_id})

    dictBoardStatuses = []
    for entry in cursor.fetchall():
        dictBoardStatuses.append(dict(entry))

    return dictBoardStatuses

@data_connection.connection_handler
def add_new_board(cursor: RealDictCursor, board_data):
    command = f"""
    INSERT INTO board(title)
    VALUES (%(title)s)
    RETURNING id
    """

    cursor.execute(command, board_data)
    return cursor.fetchone()['id']


@data_connection.connection_handler
def add_default_statuses(cursor: RealDictCursor, board_id):
    command = f"""
    INSERT INTO board_status(board_id, status_id)
    VALUES (%(board_id)s, 1),
     (%(board_id)s, 2),
     (%(board_id)s, 3),
     (%(board_id)s, 4)
    """

    cursor.execute(command, {'board_id': board_id})


@data_connection.connection_handler
def add_new_column(cursor: RealDictCursor, column_data):
    command = f"""
    INSERT INTO status(title)
    VALUES (%(title)s)
    RETURNING id
    """

    cursor.execute(command, {'title': column_data['title']})
    return cursor.fetchone()['id']


@data_connection.connection_handler
def add_column_to_boards_columns(cursor: RealDictCursor, column_data, status_id):
    command = f"""
        INSERT INTO board_status(board_id, status_id)
        VALUES (%(board_id)s, %(status_id)s)
        """

    cursor.execute(command, {'board_id': column_data['boardId'], 'status_id': status_id})
