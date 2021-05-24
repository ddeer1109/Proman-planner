from os import environ

from flask import Flask, render_template, url_for, request, jsonify, session, make_response
from util import json_response

import data_handler

import mimetypes
mimetypes.add_type('application/javascript', '.js')

app = Flask(__name__)
session = {}
app.config['SECRET_KEY'] = environ.get('SECRET_KEY')


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

@app.route("/users/<int:user_id>/get-boards")
@json_response
def get_private_boards(user_id):
    """
    All the boards
    """
    return data_handler.get_private_boards(user_id)


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


@app.route("/users/<int:user_id>/new-board", methods=["POST", "GET"])
@json_response
def post_new_private_board(user_id):
    new_board = data_handler.add_new_private_board(request.get_json(), user_id)
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

@app.route("/delete-column/<int:board_id>/<int:status_id>", methods=["DELETE"])
@json_response
def delete_column(board_id: int, status_id: int):
    data_handler.delete_column(board_id, status_id)

@app.route("/delete-board/<int:board_id>", methods=["DELETE"])
@json_response
def delete_board(board_id: int):
    data_handler.delete_board(board_id)

@app.route("/update-card", methods=["POST"])
@json_response
def update_card():
    data_handler.update_card(request.get_json())

@app.route("/update-column", methods=["PUT"])
@json_response
def update_column():
    data_handler.update_column(request.get_json())

@app.route("/update-board", methods=["PUT"])
@json_response
def update_board():
    data_handler.update_board(request.get_json())

@app.route("/update-cards-indexes", methods=["PUT"])
@json_response
def update_cards_indexes():
    data_handler.update_cards_indexes(request.get_json())


@app.route("/sign-up", methods=["POST"])
@json_response
def registration():
    print("registration")
    print(request.get_json())
    data_handler.createNewUser(request.get_json())
    return {"message": "200"}


@app.route("/sign-in", methods=["POST"])
@json_response
def login():
    response = {"validated": "false", "user_id": "", "user_name": ""}
    user_data = data_handler.get_user_if_validated(request.get_json())
    print(user_data)

    if user_data:
        response["validated"] = "true"
        response['user_id'] = user_data['id']
        response['user_name'] = user_data['login']

    return response


@app.route("/check-session/", methods=["GET"])
@json_response
def check_session():
    return session




def main():
    app.run(debug=True)


    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
