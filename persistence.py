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
    ORDER BY id
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
    SELECT id, title FROM board
    WHERE private=0
    ORDER BY id;
    """
    cursor.execute(query)

    dictBoardsList = []
    for entry in cursor.fetchall():
        dictBoardsList.append(dict(entry))

    return dictBoardsList


@data_connection.connection_handler
def get_private_boards(cursor: RealDictCursor, user_id):
    query = f"""
    SELECT board.id as id, board.title as title FROM board
    INNER JOIN users_boards
    ON board.id = users_boards.board_id
    INNER JOIN users
    ON users_boards.user_id = users.id
    WHERE users.id=%(user_id)s
    ORDER BY board.id;
    """
    cursor.execute(query, {'user_id': user_id})

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
            WHERE board_status.board_id=%(board_id)s
            ORDER BY id;            
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
    RETURNING *
    """

    cursor.execute(command, board_data)
    return dict(cursor.fetchone())


@data_connection.connection_handler
def add_new_private_board(cursor: RealDictCursor, board_data, user_id):
    command = f"""
    INSERT INTO board(title)
    VALUES (%(title)s)
    RETURNING *
    """

    cursor.execute(command, board_data)
    board = dict(cursor.fetchone())

    commandUsersBoards = f"""
        INSERT INTO users_boards(user_id, board_id)
        VALUES (%(user_id)s, %(board_id)s)
    """
    cursor.execute(commandUsersBoards, {"user_id": user_id, "board_id": board['id']})

    return board


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
    RETURNING *
    """

    cursor.execute(command, {'title': column_data['title']})
    return cursor.fetchone()


@data_connection.connection_handler
def add_column_to_boards_columns(cursor: RealDictCursor, column_data, status_id):
    command = f"""
        INSERT INTO board_status(board_id, status_id)
        VALUES (%(board_id)s, %(status_id)s)
        """

    cursor.execute(command, {'board_id': column_data['boardId'], 'status_id': status_id})


@data_connection.connection_handler
def add_new_card(cursor: RealDictCursor, card_data):
    command = f"""
        INSERT INTO card(board_id,title,status_id,index)
        VALUES (%(board_id)s, %(title)s, %(status_id)s, 
        ((select max(index) from card where board_id=%(board_id)s and status_id=%(status_id)s)) + 1)
        RETURNING *
    """

    cursor.execute(command, card_data)
    return cursor.fetchone()


@data_connection.connection_handler
def delete_card(cursor: RealDictCursor, card_id):
    command = f"""
        DELETE FROM card WHERE id=%(card_id)s
    """

    cursor.execute(command, {'card_id': card_id})

@data_connection.connection_handler
def delete_columns_cards(cursor: RealDictCursor, board_id, status_id):
    command = f"""
        DELETE FROM card
        WHERE board_id=%(board_id)s AND status_id=%(status_id)s
    """

    cursor.execute(command, {'board_id': board_id, 'status_id': status_id})

@data_connection.connection_handler
def delete_column(cursor: RealDictCursor, board_id, status_id):
    command = f"""
        DELETE FROM board_status
        WHERE board_id=%(board_id)s AND status_id=%(status_id)s
    """

    cursor.execute(command, {'board_id': board_id, 'status_id': status_id})
@data_connection.connection_handler
def delete_all_board_cards(cursor: RealDictCursor, board_id):
    command = f"""
        DELETE FROM card
        WHERE board_id=%(board_id)s
    """

    cursor.execute(command, {'board_id': board_id})

@data_connection.connection_handler
def delete_all_board_columns(cursor: RealDictCursor, board_id):
    command = f"""
        DELETE FROM board_status
        WHERE board_id=%(board_id)s
        """

    cursor.execute(command, {'board_id': board_id})

@data_connection.connection_handler
def delete_board(cursor: RealDictCursor, board_id):
    command = f"""
            DELETE FROM board
            WHERE id=%(board_id)s
            """

    cursor.execute(command, {'board_id': board_id})

@data_connection.connection_handler
def update_card(cursor: RealDictCursor, card_data):
    command = f"""
        UPDATE card SET title= %(title)s
        WHERE id=%(id)s
    """

    cursor.execute(command, {'id': card_data['card_id'], 'title': card_data['card_title']})

@data_connection.connection_handler
def update_column(cursor: RealDictCursor, column_data):
    command = f"""
        UPDATE status SET title=%(title)s
        WHERE id=%(id)s
    """
    cursor.execute(command, column_data)

@data_connection.connection_handler
def update_board(cursor: RealDictCursor, board_data):
    command = f"""
        UPDATE board SET title=%(title)s
        WHERE id=%(id)s
    """
    cursor.execute(command, board_data)

@data_connection.connection_handler
def update_cards_indexes(cursor: RealDictCursor, cards_data):
    for index, card_id in enumerate(cards_data['cards_ids']):
        command = f"""
                UPDATE card 
                SET index=%(index)s,
                status_id=%(status_id)s
                WHERE id=%(card_id)s
            """

        cursor.execute(command, {'index': index, 'card_id': card_id, 'status_id': cards_data['status_id']})

@data_connection.connection_handler
def createNewUser(cursor: RealDictCursor, user):
    command = f"""
        INSERT INTO users(login, password)
        VALUES (%(login)s, %(password)s)
    """

    cursor.execute(command, user)

@data_connection.connection_handler
def get_user(cursor: RealDictCursor, user_data):
    query = f"""
    
        SELECT id, login from users
        WHERE login=%(login)s AND password=%(password)s;
    """

    cursor.execute(query, user_data)
    return cursor.fetchone()
