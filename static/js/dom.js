// TODO
// - connect backend with update input card areas
// - implement rest of updates.
// =====================================================
// =====================================================
// =====================================================


// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";
import { drag_and_drop } from "./drag_and_drop.js";

// ================ Utilities
export let htmlSelectors = {
    getAccordionBody(boardId) {
        return document.querySelector(`div[data-board="${boardId}"]`);
    },
    getColumn(accBody, statusId) {
        // console.log(`#${boardId}${statusId}, id`);
        // return document.getElementById(`${boardId}${statusId}`);
        return accBody.querySelector(`div.status-column[data-column="${statusId}"] .column-content`)
    },
};

export let htmlComponents = {
    getModalInputForm(labelText) {
        return `
            <form id="form" class="flex-center-middle g-1" method="post">
                <div class="flex-center-middle">
                    <div class="">
                        <input id="input" type="text" class="form-control" placeholder="${labelText}" required>
                    </div>  
                    <div class="">
                        <button id="buttonSubmit" type="submit" class="btn btn-success"><i class="fas fa-check"></i></button>
                        <button id="buttonCancel" type="button" class="btn btn-warning">Cancel</button>
                    </div>
                </div>
            </form>
        `
    },
    getModalSigningForm(labelText) {
        return `
            <form id="form" class="flex-center-middle g-1" method="post">
                <div class="sign-dialogue">                     
                    <h3 class="signing">${labelText}</h3>
                    <div class="">
                        <input id="input-login" type="text" class="form-control m-1 signing" placeholder="login" required>
                        <input id="input-password" type="password" class="form-control m-1 signing" placeholder="password" required>
                    </div>  
                    <div class="registration-buttons">
                        <button id="buttonSubmit" type="submit" class="btn btn-success signing-btn m-2">Submit</button>
                        <button id="buttonCancel" type="button" class="btn btn-warning m-2">Cancel</button>
                    </div>
                </div>
            </form>
        `
    },
    unloggedSigningButtons() {
        return `
            <button id="registration" type="button" class="btn btn-outline-light m-1">Register</button>
            <button id="logging" type="button" class="btn btn-outline-light m-1">Log in</button>
        `
    }
}

export let dom = {
    accordionContainer: null,
    buttons: {
        logging: () => document.getElementById('logging'),
        registration: () => document.getElementById('registration')
    },

    init: function () {
        // This function should run once, when the page is loaded.
        dataHandler.init();
        dom.createAddBoardButton();
        dom.insertSigningButtons();

    },
    createAccordion: function (boards) {
        const accordionContainer = document.createElement('div');
        accordionContainer.setAttribute('class', 'accordion');
        accordionContainer.setAttribute('id', 'accordionContainer');
        dom.accordionContainer = accordionContainer;
        for (let board of boards) {
            dom.addNewBoardToContainer(board);
        }
        return accordionContainer;
    },

    // ===============
    // ================ USERS REGISTRATION / LOGIN

    insertSigningButtons() {
        const signingBar = document.getElementById("signing-bar");
        console.log(dataHandler.isSessionOn(), 'session')
        if (dataHandler.isSessionOn()) {
            const elements = this.setLoggedSessionBar()
            console.log(elements, 'session - elements');
        } else {
            signingBar.insertAdjacentHTML('afterbegin', htmlComponents.unloggedSigningButtons())
            console.log(this.buttons.logging())
            this.setSigningButtons()
        }
    },
    setSigningButtons() {
        dom.buttons.logging().onclick = dom.logging;
        dom.buttons.registration().onclick = dom.registration;
    },
    setLoggedSessionBar() {
        const signingBar = document.getElementById("signing-bar");
        signingBar.innerText = "";
        const span = document.createElement('span');
        span.innerText = `Logged as ${dataHandler.getSession().user_name}`
        const logoutButton = document.createElement('button');
        logoutButton.onclick = () => {
            dataHandler._session = {};
            signingBar.innerHTML = "";
            location.reload();
        }
        logoutButton.innerText = "Log out"
        logoutButton.className = "btn btn-outline-light m-1";
        span.className = "logged-span m-1"
        signingBar.appendChild(span);
        signingBar.appendChild(logoutButton);
    },
    setUsersPrivateBoards() {

    },
    registration() {
        console.log('registeration')
        dom.createRegistrationModal();

    },
    logging() {
        console.log('logging')
        dom.createLogInModal();

    },
    createRegistrationModal() {
        const modal = dom.createAddFormModal('Board title', htmlComponents.getModalSigningForm("Sign up"));
        const form = document.getElementById('form');
        const inputLogin = document.getElementById('input-login');
        const inputPassword = document.getElementById('input-password');


        form.addEventListener('submit', (event) => {
            event.preventDefault();

            dataHandler.createNewUser({login: inputLogin.value, password: inputPassword.value}, () => {
                console.log("SUCCESS new user")
                modal.remove();
            })
        });
    },
    createLogInModal() {
        const modal = dom.createAddFormModal('Board title', htmlComponents.getModalSigningForm("Sign in"));
        const form = document.getElementById('form');
        const inputLogin = document.getElementById('input-login');
        const inputPassword = document.getElementById('input-password');
        console.log(dataHandler._session);


        form.addEventListener('submit', (event) => {
            event.preventDefault();

            dataHandler.validateUserLogin({login: inputLogin.value, password: inputPassword.value}, (response) => {
                console.log(response, "response");
                if (response.validated == "true") {
                    dataHandler.setSession(response.user_id, response.user_name);
                    console.log(dataHandler._session);
                    this.setLoggedSessionBar();
                    dom.loadPrivateBoards();
                    modal.remove()
                } else {
                    alert("Incorrect logging data.")
                }
            })
        });
    },


    // ===============
    // ================ BOARDS


    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
            // console.log("data - > ", dataHandler._data)
        });
    },
    loadPrivateBoards: function () {
        console.log("private boards")
        dataHandler.getPrivateBoards( function(boards) {
            dom.showBoards(boards, false);
            console.log("boards", boards)
        })
    },
    showBoards: function (boards, withReset=true) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        const pageContainer = document.getElementById('boards');
        const accordion = dom.createAccordion(boards);
        // console.log('container', pageContainer.innerHTML);
        console.log(withReset, 'reset')
        // pageContainer.replaceChild(accordion, pageContainer.firstChild);
        setTimeout(() => {
            pageContainer.innerHTML = "";
            pageContainer.appendChild(accordion);
        }, 10)
    },
    createAddBoardButton() {
        const pageHeader = document.getElementById('page-title');
        const addingButton = document.createElement('button');
        addingButton.innerText = "add board";
        addingButton.setAttribute('class', 'btn btn-light m-1');
        addingButton.addEventListener('click', dom.showAddBoardModal)
        pageHeader.insertAdjacentElement('afterend', addingButton);
    },
    showAddBoardModal() {
        const modal = dom.createAddFormModal('Board title');
        const form = document.getElementById('form');
        const inputField = document.getElementById('input');
        // inputField.select();
        inputField.focus();

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (dataHandler.getSession() == {}) {
                dataHandler.createNewBoard({ 'title': inputField.value }, (newBoard) => {
                    dom.addNewBoardToContainer(newBoard);
                });
            } else {
                dataHandler.createNewPrivateBoard({ 'title': inputField.value }, (newBoard) => {
                    dom.addNewBoardToContainer(newBoard);
                });
            }
            modal.remove();
        });


        inputField.addEventListener('focusout', () => {
            setTimeout(() => modal.remove(), 1000);
        });
    },
    createAddFormModal(labelText="Board title", htmlForm = htmlComponents.getModalInputForm(labelText)) {
        const modal = document.createElement('div');
        const formContainer = document.createElement('div');
        modal.insertAdjacentHTML('afterbegin', htmlForm);
        formContainer.setAttribute('class', 'container-modal-form display-modal');
        formContainer.appendChild(modal);
        document.body.appendChild(formContainer);
        const cancelButton = document.getElementById('buttonCancel');

        cancelButton.addEventListener('click', () => {
            formContainer.remove();
        });
        return formContainer;
    },



    // ===============
    // ================ single_BOARD



    loadBoardContent: function (boardId) {
        // retrieves cards and makes showCards called
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.initBoardColumnsRenderPromise(boardId)
                .then(() => {
                    setTimeout(() => dom.showCards(cards), 0)
                })
                .then(() => {
                    setTimeout(() => {
                        drag_and_drop.init();
                    }, 0)
                })
        });
    },
    addNewBoardToContainer(newBoard) {
        const accItem = dom.createAccordionItem(newBoard);
        const removeBoardButton = this.addBoardButtonsDiv(accItem, accItem.getAttribute('id'))
        // accItem.lastChild.appendChild(removeBoardButton);
        accItem.lastChild.insertAdjacentElement('afterbegin', removeBoardButton);
        dom.accordionContainer.appendChild(accItem);
    },
    createAccordionItem: function (board) {
        this.headerId = `heading${board.id}`;
        this.collapseId = `collapse${board.id}`;
        this.board = board;

        this.accordionItem = document.createElement('div');
        this.accordionHeader = document.createElement('h2');
        const accordionButton = document.createElement('button');
        this.accordionCollapseBody = document.createElement('div');

        this.accordionItem.setAttribute('class', `accordion-item`);
        this.accordionItem.setAttribute('id', `${board.id}`);
        dom.setAccordionHeaderAttributes();
        dom.setAccordionButtonAttributes(accordionButton);

        accordionButton.addEventListener('click', () => {
            dom.processAccordionItemExpanding(board.id, accordionButton)
        }
        );
        dom.setAccordionCollapseBody();

        this.accordionHeader.appendChild(accordionButton);
        this.accordionItem.appendChild(this.accordionHeader);
        this.accordionItem.appendChild(this.accordionCollapseBody);
        return this.accordionItem;
    },

    addBoardButtonsDiv(accordionItem, board_id) {
        const buttonRemoveBoard = this.createRemoveBoardButton(accordionItem, board_id);

        const buttonUpdateBoard = this.createUpdateBoardButton(accordionItem, board_id);

        const removeBoardDiv = document.createElement('div')
        removeBoardDiv.setAttribute('class', 'board-buttons-div');
        removeBoardDiv.appendChild(buttonUpdateBoard);
        removeBoardDiv.appendChild(buttonRemoveBoard);

        return removeBoardDiv
    },
    createRemoveBoardButton(accordionItem, board_id) {
        const buttonRemoveBoard = document.createElement('button');
        buttonRemoveBoard.setAttribute('class', 'btn btn-danger m-1');
        buttonRemoveBoard.innerText = 'Remove Board';
        buttonRemoveBoard.addEventListener('click', () => {
            if (window.confirm("Are you sure to remove this board?")) {
                dataHandler.deleteBoard(board_id, () => {
                    accordionItem.remove()
                })
            }
        })
        return buttonRemoveBoard;
    },
    createUpdateBoardButton(accordionItem, board_id) {
        const buttonRemoveBoard = document.createElement('button');
        buttonRemoveBoard.setAttribute('class', 'btn btn-warning m-1');
        buttonRemoveBoard.innerText = 'Rename board';
        buttonRemoveBoard.addEventListener('click', () => {
            const boardHeadingButton = accordionItem.querySelector(`h2#heading${board_id} button`);
            const updateForm = this.createUpdateBoard(boardHeadingButton, board_id, () => {
                updateForm.replaceWith(boardHeadingButton);
            })
            boardHeadingButton.replaceWith(updateForm);
            updateForm.querySelector('#input').select();
        })
        return buttonRemoveBoard;
    },
    processAccordionItemExpanding(board_id, accordionButton) {
        accordionButton.setAttribute('disabled', 'true');

        dom.loadBoardContent(board_id);
        setTimeout(() => {
            accordionButton.removeAttribute('disabled');
        }, 1000)
    },
    setAccordionHeaderAttributes() {
        this.accordionHeader.setAttribute('class', 'accordion-header');
        this.accordionHeader.setAttribute('id', this.headerId);
    },
    setAccordionButtonAttributes(accordionButton) {
        accordionButton.innerText = `${this.board.title}`;
        accordionButton.setAttribute('class', 'accordion-button collapsed');
        accordionButton.setAttribute('type', 'button');
        accordionButton.setAttribute('data-bs-toggle', 'collapse');
        accordionButton.setAttribute('data-bs-target', `#${this.collapseId}`);
        accordionButton.setAttribute('aria-expanded', `false`);
        accordionButton.setAttribute('aria-controls', this.collapseId);
        accordionButton.setAttribute('click-cooldown', 'false');
    },
    setAccordionCollapseBody() {
        this.accordionCollapseBody.setAttribute('id', this.collapseId);
        this.accordionCollapseBody.setAttribute('class', "accordion-collapse collapse");
        this.accordionCollapseBody.setAttribute('aria-labelledby', this.headerId);
        this.accordionCollapseBody.setAttribute('data-bs-parent', `#accordionContainer`);

        // TODO - remove this 4 elements
        // const removeBoardDiv = document.createElement('div')
        // removeBoardDiv.setAttribute('class', 'remove-board-div')
        // const removeBoardButton = this.removeBoardButton();
        // removeBoardDiv.appendChild(removeBoardButton);

        const addColumnDiv = document.createElement('div');
        addColumnDiv.setAttribute('class', "add-col-btn")
        const boardId = this.board.id;
        const addColumnButton = dom.createAddColumnButton(boardId);
        addColumnDiv.appendChild(addColumnButton);

        const accordionBody = document.createElement('div');
        accordionBody.setAttribute('class', 'accordion-body container');
        accordionBody.setAttribute('data-board', `${this.board.id}`);

        // this.accordionCollapseBody.appendChild(removeBoardDiv);
        this.accordionCollapseBody.appendChild(accordionBody);
        this.accordionCollapseBody.appendChild(addColumnDiv);
    },


    // ===============
    // =============== COLUMNS



    initBoardColumnsRenderPromise(boardId) {
        const accBody = htmlSelectors.getAccordionBody(boardId);
        accBody.innerHTML = "";
        return new Promise(resolve => {
            dataHandler.getBoardsStatuses(boardId, function (boardStatuses) {
                // console.log('board statuses 11111 -', boardStatuses)
                dom.createStatusesColumns(accBody, boardStatuses);
                resolve();
            });
        });
    },
    createStatusesColumns(accBody, boardStatuses) {
        const boardId = parseInt(accBody.getAttribute('data-board'))

        // add status-columns
        for (let status of boardStatuses) {
            const colDiv = dom.createStatusColumn(boardId, status)

            accBody.appendChild(colDiv);
        }
    },
    createUpdateColumn(title, columnId, callback) {
        const updateForm = document.createElement('form');
        updateForm.setAttribute('class', 'flex-center-middle g-1 my-card-form')
        updateForm.setAttribute('method', 'post')
        updateForm.addEventListener('submit', (evt) => {
            // removeEventListener() - i przywrócenie // lub flaga
            evt.preventDefault()
            updateInput.blur()

            dataHandler.updateColumn({ id: columnId, title: updateInput.value }, () => {
                title.innerText = updateInput.value;

            })
        })

        const updateInput = document.createElement('input');
        updateInput.setAttribute('value', title.innerText);
        updateInput.setAttribute('class', 'form-control update-card');
        updateInput.setAttribute('id', 'input');
        updateInput.addEventListener("focusout", () => {
            setTimeout(() => {
                // remove event listener - nie anonimowa funkcja
                // if flaga == true ...
                callback()
            }, 150)
        })

        const updateButton = document.createElement('button');
        updateButton.setAttribute('class', 'btn btn-success update-card');
        updateButton.insertAdjacentHTML('afterbegin', '<i class="fas fa-check"></i>');

        updateForm.appendChild(updateInput);
        updateForm.appendChild(updateButton);

        return updateForm
    },
    createUpdateBoard(title, boardId, callback) {
        const updateForm = document.createElement('form');
        updateForm.setAttribute('class', 'flex-center-middle g-1 my-card-form')
        updateForm.setAttribute('method', 'post')
        updateForm.addEventListener('submit', (evt) => {
            evt.preventDefault()
            updateInput.blur()

            // dataHandler.updateColumn({ id: boardId, title: updateInput.value}, () => {
            //     title.innerText = updateInput.value;
            // })
            dataHandler.updateBoard({ id: boardId, title: updateInput.value }, () => {
                title.innerText = updateInput.value;
            });
        })

        const updateInput = document.createElement('input');
        updateInput.setAttribute('value', title.innerText);
        updateInput.setAttribute('class', 'form-control update-card');
        updateInput.setAttribute('id', 'input');
        updateInput.addEventListener("focusout", () => {
            setTimeout(() => {
                callback()
            }, 150)
        })

        const updateButton = document.createElement('button');
        updateButton.setAttribute('class', 'btn btn-success update-card');
        updateButton.insertAdjacentHTML('afterbegin', '<i class="fas fa-check"></i>');

        updateForm.appendChild(updateInput);
        updateForm.appendChild(updateButton);

        return updateForm
    },
    createStatusColumn(boardId, status) {

        const colDiv = document.createElement('div');

        const headerContainer = document.createElement('div')
        headerContainer.setAttribute('class', 'column-header-container card');

        const statusTitle = document.createElement('h4');
        const btnDeleteColumn = this.createColumnButtonDelete(boardId, status, colDiv);

        const statusContent = document.createElement('div');
        const buttonAddCard = dom.createAddCardButton(boardId, status.id)

        statusContent.appendChild(buttonAddCard)

        statusTitle.innerText = status.title;
        statusContent.setAttribute('class', 'column-content');
        statusContent.setAttribute('data-column', status.id);

        headerContainer.appendChild(statusTitle);
        headerContainer.appendChild(btnDeleteColumn);

        colDiv.classList.add(`status-column`);
        colDiv.setAttribute('data-column', status.id);
        colDiv.appendChild(headerContainer);
        colDiv.appendChild(statusContent);

        const updateContainer = document.createElement('div')
        updateContainer.setAttribute('class', 'column-header-container card');

        const columnId = colDiv.getAttribute('data-column');

        const updateSection = this.createUpdateColumn(statusTitle, columnId, () => {

            updateContainer.replaceWith(headerContainer)
        })
        updateContainer.appendChild(updateSection)

        headerContainer.addEventListener('dblclick', () => {
            headerContainer.replaceWith(updateContainer)
            updateContainer.querySelector('#input').select();
        })


        return colDiv;
    },
    createColumnButtonDelete(boardId, status, column) {
        const btnDeleteColumn = document.createElement('button');
        btnDeleteColumn.setAttribute('class', 'btn btn-danger btn-sm button-card-delete')
        btnDeleteColumn.innerHTML = '<i class="fas fa-trash"></i>'
        btnDeleteColumn.addEventListener('click', () => {
            if (confirm('Are you sure to delete column?')) {
                dataHandler.deleteColumn(boardId, status.id, () => {
                    column.remove()
                })
            }
        })

        return btnDeleteColumn;
    },
    showAddColumnModal(boardId) {
        const modal = dom.createAddColumnModal('Column name', boardId);
        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputField = document.getElementById('input');
            dataHandler.createNewColumn({ 'title': inputField.value, 'boardId': boardId }, (newColumn) => {
                modal.replaceWith(dom.createAddColumnButton(boardId));
                dom.appendColumnToBoard(boardId, newColumn);
            });
        });
    },
    createAddColumnModal(labelText, boardId) {
        const modal = document.createElement('div');
        modal.insertAdjacentHTML('afterbegin', htmlComponents.getModalInputForm(labelText));
        modal.querySelector('#buttonCancel').remove();
        htmlSelectors.getAccordionBody(boardId).nextSibling.firstChild.replaceWith(modal);
        const inputField = document.getElementById('input');
        inputField.focus();
        // inputField.select();
        inputField.addEventListener('focusout', () => {
            setTimeout(() => {
                modal.replaceWith(dom.createAddColumnButton(boardId))
            }, 100)
        });
        return modal;
    },
    createAddColumnButton(boardId) {
        const addColumnButton = document.createElement('button');
        addColumnButton.addEventListener('click', () => {
            dom.showAddColumnModal(boardId);
        });
        addColumnButton.setAttribute('class', 'btn btn-light');
        addColumnButton.innerText = "add column";
        return addColumnButton;
    },
    appendColumnToBoard(boardId, newColumn) {
        const columnDiv = dom.createStatusColumn(boardId, newColumn);
        const boardAccBody = htmlSelectors.getAccordionBody(boardId);
        boardAccBody.appendChild(columnDiv);
    },


    // ===============
    // ================     CARDS


    showCards: function (cards) {
        if (cards.length != 0) {
            const accBody = htmlSelectors.getAccordionBody(cards[0].board_id);
            for (let card of cards) {
                const cardNew = dom.createCard(card);
                dom.appendCardToColumn(accBody, cardNew, card.status_id);
            }
        }
    },
    createCard(card) {
        const cardDiv = document.createElement('div');
        cardDiv.setAttribute('class', 'card');
        cardDiv.setAttribute('data-card', `${card.id}`);
        cardDiv.setAttribute('data-index', `${card.index}`);
        cardDiv.setAttribute('draggable', 'true');
        cardDiv.innerText = card.title;

        const buttonDelete = document.createElement('button')
        buttonDelete.setAttribute('class', 'btn btn-danger btn-sm button-card-delete')
        const trashIcon = document.createElement('i');
        trashIcon.setAttribute('class', 'fas fa-trash')
        buttonDelete.appendChild(trashIcon);
        buttonDelete.addEventListener('click', () => {
            dom.deleteCard(cardDiv, card.id);
        });
        const updateSection = this.createUpdateSection(card.title, cardDiv);

        cardDiv.addEventListener('dblclick', function () {
            this.replaceWith(updateSection);
            updateSection.querySelector("#input").focus();
        })

        cardDiv.appendChild(buttonDelete);

        return cardDiv;
    },
    createUpdateSection(cardTitle, cardDiv) {
        // const updateForm = htmlComponents.getModalInputForm("XYZ");
        const updateForm = document.createElement('form');
        updateForm.setAttribute('class', 'flex-center-middle g-1 my-card-form')
        updateForm.setAttribute('method', 'post')

        updateForm.addEventListener('submit', (evt) => {
            evt.preventDefault()
            const id = cardDiv.getAttribute('data-card')
            const title = updateInput.value;
            dataHandler.updateCard({ 'card_id': id, 'card_title': title }, () => {
                cardDiv = dom.createCard({ id: id, title: title })
                updateForm.replaceWith(cardDiv);
                setTimeout(() => {
                    drag_and_drop.init()
                }, 100)
                updateInput.blur()
            })
        })

        const updateContainer = document.createElement('div');
        updateContainer.setAttribute('class', 'flex-center-middle');

        const updateInput = document.createElement('input');
        updateInput.setAttribute('value', cardTitle);
        updateInput.setAttribute('class', 'form-control update-card');
        updateInput.setAttribute('id', 'input');
        updateInput.addEventListener("focusout", () => {
            setTimeout(() => {
                updateForm.replaceWith(cardDiv);
            }, 150)
        })

        const updateButton = document.createElement('button');
        updateButton.setAttribute('class', 'btn btn-success update-card');
        updateButton.insertAdjacentHTML('afterbegin', '<i class="fas fa-check"></i>');

        updateContainer.appendChild(updateInput);
        updateContainer.appendChild(updateButton);
        updateForm.appendChild(updateContainer);

        return updateForm;
    },
    appendCardToColumn(accordionBody, cardDiv, cardStatusId) {
        const column = htmlSelectors.getColumn(accordionBody, cardStatusId);
        column.appendChild(cardDiv);
    },
    appendNewCardToColumn(columnId, card) {
        const cardDiv = dom.createCard(card);
        const boardAccBody = htmlSelectors.getAccordionBody(card.board_id);
        const cardsStatusColumnDiv = htmlSelectors.getColumn(boardAccBody, columnId);
        cardsStatusColumnDiv.appendChild(cardDiv);
        setTimeout(() => {
            drag_and_drop.init()
        }, 100)
    },
    deleteCard(card, card_id) {
        dataHandler.deleteCard(card_id, () => {
            card.remove()
        })
    },
    createAddCardButton(boardId, statusId) {
        const container = document.createElement('div');
        const buttonAddCard = document.createElement('button');

        buttonAddCard.setAttribute('class', 'btn btn-primary btn-sm');
        container.setAttribute('class', 'addCard');
        buttonAddCard.innerText = 'Add Card';
        buttonAddCard.style.width = '100%';

        container.appendChild(buttonAddCard);

        buttonAddCard.addEventListener('click', () => {
            dom.showAddCardModal(boardId, statusId);
        })
        return container;
    },
    showAddCardModal(boardId, columnId) {
        const modal = dom.createAddCardModal("Card title", boardId, columnId);
        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputValue = document.getElementById('input').value;
            const dataObject = { 'title': inputValue, 'board_id': boardId, 'status_id': columnId };
            dataHandler.createNewCard(dataObject, (card) => {
                const button = dom.createAddCardButton(boardId, columnId);
                modal.replaceWith(button);
                dom.appendNewCardToColumn(columnId, card);
            })
        });
    },
    createAddCardModal(labelText, boardId, statusId) {
        const modalouter = document.createElement('div');
        const modal = document.createElement('div');
        modal.setAttribute('class', "add-card-modal");
        modalouter.style.height = "40px";
        modal.insertAdjacentHTML('afterbegin', htmlComponents.getModalInputForm(labelText));
        modal.querySelector('#buttonCancel').remove();
        modal.querySelector('.flex-center-middle').setAttribute('class', "flex-add-card");

        const accBody = htmlSelectors.getAccordionBody(boardId);
        const column = htmlSelectors.getColumn(accBody, statusId).querySelector('div.addCard');
        modalouter.appendChild(modal)
        column.replaceWith(modalouter)
        const inputField = document.getElementById('input');
        inputField.focus();
        // inputField.select();
        inputField.addEventListener('focusout', () => {
            const newButton = dom.createAddCardButton(boardId, statusId);
            setTimeout(() => {
                modalouter.replaceWith(newButton);
            }, 100)
        });
        return modalouter;
    },
}

