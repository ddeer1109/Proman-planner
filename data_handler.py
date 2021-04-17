import persistence


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


def get_boards():
    """
    Gather all boards
    :return:
    """
    boards = persistence.get_boards()

    return boards


def get_board(board_id):
    single_board = [board for board in get_boards() if int(board['id']) == board_id]
    return single_board[0]


def get_cards_for_board(board_id):
    persistence.clear_cache()
    all_cards = persistence.get_cards(board_id)
    return all_cards


def get_statuses():
    return persistence.get_statuses()


def get_board_statuses(board_id):
    return persistence.get_board_statuses(board_id)