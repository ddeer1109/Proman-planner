import {dataHandler} from "./data_handler.js";
import {dom} from "./dom.js";
import {drag_and_drop} from "./drag_and_drop.js";

export const evHandler = {
    abort: {
        addBoard: function(modal) {
            const clickEvent = (ev) => {
                const buttonSubmit = document.getElementById("buttonSubmit");
                if (buttonSubmit != null && !document.getElementById("buttonSubmit").contains(ev.target)) {
                    modal.remove()
                }
                document.removeEventListener('click', clickEvent)
            }
            document.addEventListener("click", clickEvent)
        },
        updateBoardOrColumn(callback) {
            const clickOutEvent = (ev) => {
                const buttonSubmit = document.getElementById("buttonSubmit");
                if (buttonSubmit != null && !buttonSubmit.contains(ev.target)){
                    callback();
                }
                document.removeEventListener('click', clickOutEvent)
            }

            document.addEventListener('click', clickOutEvent)
        },
    },
    submitRegistration: (modal, userData) => {

            dataHandler.createNewUser(userData, () => {
                console.log("SUCCESS new user")
                modal.remove();
            })
        },
    submitLogin: function(userData, modal) {
        dataHandler.validateUserLogin(userData, (response) => {
                console.log(response, "response");
                if (response.validated === "true") {
                    dataHandler.setSession(response.user_id, response.user_name);
                    console.log(dataHandler._session);
                    dom.setLoggedSessionBar();
                    dom.loadPrivateBoards();
                    modal.remove()
                } else {
                    alert("Incorrect logging data.")
                }
            })
    },
    submitAddBoard: function(boardData, modal) {
        const userInSession = dataHandler.getSession().id;
        console.log(userInSession);
        console.log(boardData)
        if (userInSession === undefined) {
            dataHandler.createNewBoard(boardData,
                (newBoard) => dom.addNewBoardToContainer(newBoard));
        } else {
            dataHandler.createNewPrivateBoard(boardData,
                (newBoard) => dom.addNewBoardToContainer(newBoard));
        }
        modal.remove();
    },

    removeBoard(accordionItem, board_id) {
        const confirmed = window.confirm("Are you sure to remove this board?");
        if (confirmed) {
            dataHandler.deleteBoard(board_id, () => accordionItem.remove());
        }
    },
    renameBoard(accordionItem, board_id) {
        const boardHeadingButton = accordionItem.querySelector(`h2#heading${board_id} button`);
        const boardHeadingButton1 = accordionItem.querySelector(`h2#heading${board_id}`);
        console.log(boardHeadingButton1);
        boardHeadingButton1.classList.add("darkned");
        const updateForm = dom.createUpdateBoard(boardHeadingButton, board_id, () => {
            boardHeadingButton1.classList.remove("darkned");
            updateForm.replaceWith(boardHeadingButton);
        })
        boardHeadingButton.replaceWith(updateForm);
        updateForm.querySelector('#input').select();
    },
    submitUpdateBoard(boardData, titleDiv, callback) {
        dataHandler.updateBoard(boardData, () => {
                titleDiv.innerText = boardData.title;
                callback();
            });
    },
    submitUpdateColumn(columnData, titleDiv, callback) {
        dataHandler.updateColumn(columnData, () => {
                titleDiv.innerText = columnData.title;
                callback();
            });
    },
    updateCard(id, title, updateForm) {
        dataHandler.updateCard({ 'card_id': id, 'card_title': title }, async () => {
                const cardDiv = dom.createCard({ id: id, title: title })
                updateForm.replaceWith(cardDiv);
                await drag_and_drop.init()
            })
    },
    removeColumn(boardId, statusId, column) {
        const confirmed = confirm('Are you sure to delete column?');
        if (confirmed) {
            dataHandler.deleteColumn(boardId, statusId, () => column.remove())
        }
    }
}