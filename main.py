from flask import Flask, render_template, url_for, request, jsonify
from util import json_response

import data_handler

import mimetypes
mimetypes.add_type('application/javascript', '.js')

app = Flask(__name__)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return data_handler.get_boards()


@app.route("/get-board/<int:board_id>")
@json_response
def get_board(board_id: int):
    return data_handler.get_board(board_id)


@app.route("/get-cards/<int:board_id>")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id)


@app.route("/get-statuses")
@json_response
def get_statuses():
    """
        All the statuses
    """
    return data_handler.get_statuses()


@app.route("/get-board-statuses/<int:board_id>")
@json_response
def get_board_statuses(board_id: int):
    return data_handler.get_board_statuses(board_id)


@app.route("/new-board", methods=["POST", "GET"])
@json_response
def post_new_board():
    new_board = data_handler.add_new_board(request.get_json())
    return new_board


@app.route("/new-column", methods=["POST"])
@json_response
def post_new_column():
    # print(request.get_json(), "json!")
    new_column = data_handler.add_new_column(request.get_json())
    print(new_column)
    return new_column

@app.route("/new-card", methods=["POST"])
@json_response
def post_new_card():
    new_card = data_handler.add_new_card(request.get_json())
    print(new_card)
    return new_card

@app.route("/delete-card/<int:card_id>", methods=["DELETE"])
@json_response
def delete_card(card_id: int):
    data_handler.delete_card(card_id)

def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
