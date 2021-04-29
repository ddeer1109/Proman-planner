// this object contains the functions which handle the data and its reading/writing
// feel free to extend and change to fit your needs

// (watch out: when you would like to use a property/function of an object from the
// object itself then you must use the 'this' keyword before. For example: 'this._data' below)
export let dataHandler = {
    _data: {}, // it is a "cache for all data received: boards, cards and statuses. It is not accessed from outside.
    _api_get: function (url, callback) {
        // it is not called from outside
        // loads data from API, parses it and calls the callback with it

        fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        })
            .then(response => response.json())  // parse the response as JSON
            .then(json_response => {
                // console.log("json response", json_response);
                callback(json_response)
            });  // Call the `callback` with the returned object
    },
    _api_post: function (url, data, callback) {
        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',

            body: JSON.stringify(data)
        }
        )
            .then(response => response.json())
            .then(json_response => {
                // console.log("json response", json_response)
                callback(json_response)
            });
    },
    _api_put: function (url, data, callback) {
        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT',

            body: JSON.stringify(data)
        }
        )
            .then(response => response.json())
            .then(json_response => {
                // console.log("json response", json_response)
                callback(json_response)
            });
    },
    _api_delete: function (url, callback) {
        fetch(url, {
            method: 'DELETE'
        }).then(callback)
    },
    init: function () {
        // this.getStatuses();
    },
    getBoards: function (callback) {
        // the boards are retrieved and then the callback function is called with the boards

        // Here we use an arrow function to keep the value of 'this' on dataHandler.
        //    if we would use function(){...} here, the value of 'this' would change.
        this._api_get('/get-boards', (response) => {
            this._data['boards'] = response;
            callback(response);
        });
    },
    getBoard: function (boardId, callback) {
        // the board is retrieved and then the callback function is called with the board
        this._api_get(`/get-board/${boardId}`, (response) => {

            callback(response)
        })

    },
    getStatuses: function (callback) {
        // the statuses are retrieved and then the callback function is called with the statuses
        this._api_get('/get-statuses', (response) => {
            this._data['statuses'] = response;
            callback(response);
        });
    },
    getStatus: function (statusId, callback) {
        // the status is retrieved and then the callback function is called with the status
    },
    getBoardsStatuses: function (boardId, callback) {
        this._api_get(`get-board-statuses/${boardId}`, (response) => {
            let tempObject = this._data['boards'].filter(board => board.id == boardId);
            // console.log(tempObject, "asd");
            tempObject[0].statuses = response;
            // console.log(response, "board statuses");
            callback(response);
        })
    },

    getCardsByBoardId: function (boardId, callback) {
        // the cards are retrieved and then the callback function is called with the cards
        this._api_get(`get-cards/${boardId}`, (response) => {
            let tempObject = this._data['boards'].filter(board => board.id == boardId);
            tempObject[0].cards = response;
            // console.log(response, 'card by id')
            callback(response);
        })

    },
    getCard: function (cardId, callback) {
        // the card is retrieved and then the callback function is called with the card
    },
    createNewBoard: function (boardData, callback) {
        // creates new board, saves it and calls the callback function with its data
        this._api_post('/new-board', boardData, (response) => {
            this._data['boards'].push(response);
            callback(response);
        });
    },
    createNewCard: function (cardData, callback) {
        // creates new card, saves it and calls the callback function with its data

        this._api_post('/new-card', cardData, (response) => {
            const boardCards = this._data['boards']
                .filter(board => board.id == cardData.board_id)[0].cards
            boardCards.push(response);
            callback(response);
        })
    },
    // here comes more features
    createNewColumn: function (columnData, callback) {
        this._api_post('/new-column', columnData, (response) => {
            const boardStatuses = this._data['boards']
                .filter(board => board.id == columnData.boardId)[0].statuses
            boardStatuses.push(response);
            callback(response);
        })
    },
    deleteCard: function (id, callback) {
        this._api_delete(`/delete-card/${id}`, () => {
            callback();
        })
    },
    deleteColumn: function (boardId, statusId, callback) {
        this._api_delete(`/delete-column/${boardId}/${statusId}`, () => {
            callback();
        })
    },
    deleteBoard(board_id, callback) {
        this._api_delete(`/delete-board/${board_id}`, () => {
            callback();
        })
    },
    updateCard(card_data, callback) {
        this._api_post(`/update-card`, card_data, () => {
            callback();
        })
    },
    updateColumn(column_data, callback) {
        this._api_put(`/update-column`, column_data, () => {
            callback();
        })
    },
    updateBoard(boardData, callback) {
        this._api_put(`/update-board`, boardData, () => {
            callback();
        })
    },


};
