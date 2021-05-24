// TODO
// - connect backend with update input card areas
// - implement rest of updates.
// =====================================================
// =====================================================
// =====================================================


// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";
import { drag_and_drop } from "./drag_and_drop.js";
import {evHandler} from "./evHandler.js";
import { components } from "./htmlComponents.js";

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
    registration() {
        console.log('registeration')
        dom.createRegistrationModal();

    },
    logging() {
        console.log('logging')
        dom.createLogInModal();

    },
    createRegistrationModal() {
        const modal = dom.createFullScreenFormModal('Board title', components.plainHtml.getModalSigningForm("Sign up"));
        const form = document.getElementById('form');
        const inputLogin = document.getElementById('input-login');
        const inputPassword = document.getElementById('input-password');
        inputLogin.focus();
        form.addEventListener('submit', function(ev) {
            ev.preventDefault();
            const userData = {login: inputLogin.value, password: inputPassword.value};
            evHandler.submitRegistration(modal, userData);
        });
    },
    createLogInModal() {
        const modal = dom.createFullScreenFormModal('Sign up', components.plainHtml.getModalSigningForm("Sign up"));
        const form = document.getElementById('form');
        const inputLogin = document.getElementById('input-login');
        const inputPassword = document.getElementById('input-password');
        inputLogin.focus();
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const userData = {login: inputLogin.value, password: inputPassword.value};
            evHandler.submitLogin(userData, modal)
        });
    },
    insertSigningButtons() {
        const signingBar = document.getElementById("signing-bar");
        console.log(dataHandler.isSessionOn(), 'session')
        if (dataHandler.isSessionOn()) {
            const elements = this.setLoggedSessionBar()
            console.log(elements, 'session - elements');
        } else {
            signingBar.insertAdjacentHTML('afterbegin', components.plainHtml.unloggedSigningButtons())
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
    showBoards: async function (boards, withReset=true) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        const pageContainer = document.getElementById('boards');
        const accordion = await dom.createAccordion(boards);
        pageContainer.innerHTML = "";
        await pageContainer.appendChild(accordion);
    },
    createAddBoardButton() {
        const pageHeader = document.getElementById('page-title');
        const addNewBoardButton = document.createElement('button');
        addNewBoardButton.innerText = "add board";
        addNewBoardButton.setAttribute('class', 'btn btn-light m-1');
        addNewBoardButton.addEventListener('click', dom.showAddBoardModal)
        pageHeader.insertAdjacentElement('afterend', addNewBoardButton);
    },
    showAddBoardModal() {
        const modal = dom.createFullScreenFormModal();
        const form = document.getElementById('form');
        const inputField = document.getElementById('input');
        // inputField.select();
        inputField.focus();

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const boardData = { 'title': inputField.value };
            evHandler.submitAddBoard(boardData, modal)
        });

        inputField.addEventListener('focusout',
            () => evHandler.abort.addBoard(modal));
    },
    createFullScreenFormModal(labelText="Board title", htmlForm = components.plainHtml.getModalInputForm(labelText)) {
        const modal = document.createElement('div');
        const formContainer = document.createElement('div');
        modal.insertAdjacentHTML('afterbegin', htmlForm);
        formContainer.setAttribute('class', 'container-modal-form display-modal');
        formContainer.appendChild(modal);
        document.body.appendChild(formContainer);
        const cancelButton = document.getElementById('buttonCancel');
        cancelButton.addEventListener('click', () => formContainer.remove());
        return formContainer;
    },



    // ===============
    // ================ single_BOARD



    loadBoardContent: function (boardId) {
        // retrieves cards and makes showCards called
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.initBoardColumnsRenderPromise(boardId)
                .then(() => dom.showCards(cards))
                .then(() =>drag_and_drop.init())
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
        this.accordionHeader = components.board.accordionHeader(this.headerId);
        const accordionButton = components.board.accordionButton(board.title, this.collapseId);
        this.accordionCollapseBody = document.createElement('div');

        this.accordionItem.setAttribute('class', `accordion-item`);
        this.accordionItem.setAttribute('id', `${board.id}`);

        accordionButton.addEventListener('click',
            () => dom.processAccordionItemExpanding(board.id, accordionButton));

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
        buttonRemoveBoard.addEventListener('click',
            () => evHandler.removeBoard(accordionItem, board_id))
        return buttonRemoveBoard;
    },
    createUpdateBoardButton(accordionItem, board_id) {
        const buttonRenameBoard = document.createElement('button');
        buttonRenameBoard.setAttribute('class', 'btn btn-warning m-1 ');
        buttonRenameBoard.innerText = 'Rename board';
        buttonRenameBoard.addEventListener('click',
            (ev) => {
                ev.target.disabled = true;
                setTimeout(() => ev.target.disabled = false, 1000);
                evHandler.renameBoard(accordionItem, board_id)
            });
        return buttonRenameBoard;
    },
    processAccordionItemExpanding(board_id, accordionButton) {
        accordionButton.setAttribute('disabled', 'true');

        dom.loadBoardContent(board_id);
        setTimeout(() => {
            accordionButton.removeAttribute('disabled');
        }, 1000)
    },
    setAccordionCollapseBody() {
        this.accordionCollapseBody.setAttribute('id', this.collapseId);
        this.accordionCollapseBody.setAttribute('class', "accordion-collapse collapse");
        this.accordionCollapseBody.setAttribute('aria-labelledby', this.headerId);
        this.accordionCollapseBody.setAttribute('data-bs-parent', `#accordionContainer`);

        const addColumnDiv = document.createElement('div');
        addColumnDiv.setAttribute('class', "add-col-btn")
        const boardId = this.board.id;
        const addColumnButton = components.column.newColumnButton(boardId);
        addColumnDiv.appendChild(addColumnButton);

        const accordionBody = document.createElement('div');
        accordionBody.setAttribute('class', 'accordion-body container');
        accordionBody.setAttribute('data-board', `${this.board.id}`);

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
    createUpdateColumn(titleDiv, columnId, callback) {
        const updateButton = components.updateSubmitButton();

        const submitEv =
            (ev) => {
                ev.preventDefault();
                const columnData = { id: columnId, title: updateInput.value }
                evHandler.submitUpdateColumn(columnData, titleDiv, callback)
        };
        const abortEv =
            () => evHandler.abort.updateBoardOrColumn(callback);

        const updateForm = components.column.updateForm(submitEv);
        const updateInput = components.column.updateInput(titleDiv.innerText, abortEv);

        updateForm.appendChild(updateInput);
        updateForm.appendChild(updateButton);

        return updateForm
    },
    createUpdateBoard(title, boardId, callback) {
        const updateForm = components.board.updateForm();
        const updateButton = components.updateSubmitButton();
        const updateInput = components.board.updateInput(title.innerText);
        const submitEv = (evt) => {
            evt.preventDefault()
            const boardData = { id: boardId, title: updateInput.value };
            evHandler.submitUpdateBoard(boardData, title, callback)
        }
        const abortUpdateEv = () => evHandler.abort.updateBoardOrColumn(callback)

        updateForm.addEventListener('submit', submitEv)
        updateInput.addEventListener("focusout", abortUpdateEv)

        updateForm.appendChild(updateInput);
        updateForm.appendChild(updateButton);

        return updateForm
    },
    createStatusColumn(boardId, status) {
        const dbClickEv = () => {
            headerContainer.replaceWith(updateContainer)
            updateContainer.querySelector('#input').select();
        }
        const colDiv = document.createElement('div');
        colDiv.classList.add(`status-column`);
        colDiv.setAttribute('data-column', status.id);

        const headerContainer = components.column.headerContainer(dbClickEv);
        const statusTitle = document.createElement('h4');
        statusTitle.innerText = status.title;
        const btnDeleteColumn = components.column.deleteButton(boardId, status, colDiv);

        const statusContent = components.column.content(boardId, status);

        headerContainer.appendChild(statusTitle);
        headerContainer.appendChild(btnDeleteColumn);

        colDiv.appendChild(headerContainer);
        colDiv.appendChild(statusContent);

        const updateContainer = document.createElement('div')
        updateContainer.setAttribute('class', 'column-header-container card');
        const updateSection = this.createUpdateColumn(statusTitle, status.id, () => {
            updateContainer.replaceWith(headerContainer)
        })
        updateContainer.appendChild(updateSection)

        return colDiv;
    },

    showAddColumnModal(boardId) {
        const modal = dom.createAddColumnModal('Column name', boardId);
        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputField = document.getElementById('input');
            dataHandler.createNewColumn({ 'title': inputField.value, 'boardId': boardId }, (newColumn) => {
                modal.replaceWith(components.column.newColumnButton(boardId));
                dom.appendColumnToBoard(boardId, newColumn);
            });
        });
    },
    createAddColumnModal(labelText, boardId) {
        const modal = document.createElement('div');
        modal.insertAdjacentHTML('afterbegin', components.plainHtml.getModalInputForm(labelText));
        modal.querySelector('#buttonCancel').remove();
        htmlSelectors.getAccordionBody(boardId).nextSibling.firstChild.replaceWith(modal);
        const inputField = document.getElementById('input');
        inputField.focus();
        // inputField.select();
        const abortEv = () => {
            const addColumnButton = components.column.newColumnButton(boardId);
            modal.replaceWith(addColumnButton)
        }
        inputField.addEventListener('focusout', () => {
            evHandler.abort.updateBoardOrColumn(abortEv);
        });
        return modal;
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
        const updateSection = this.createCardUpdateForm(card.title, cardDiv);

        cardDiv.addEventListener('dblclick', function () {
            this.replaceWith(updateSection);
            updateSection.querySelector("#input").focus();
        })

        cardDiv.appendChild(buttonDelete);

        return cardDiv;
    },
    createCardUpdateForm(cardTitle, cardDiv) {
        // const updateForm = components.plainHtml.getModalInputForm("XYZ");
        const submitEv = (evt) => {
            evt.preventDefault()
            const id = cardDiv.getAttribute('data-card')
            const title = updateInput.value;
            evHandler.updateCard(id, title, updateForm);
        }
        const abortEv = () => evHandler.abort.updateBoardOrColumn(updateButton,
            () => updateForm.replaceWith(cardDiv))
        const updateForm = components.card.updateForm(submitEv);
        const updateContainer = document.createElement('div');
        updateContainer.setAttribute('class', 'flex-center-middle');

        const updateInput = components.card.updateInput(cardTitle, abortEv);
        const updateButton = components.updateSubmitButton();

        updateContainer.appendChild(updateInput);
        updateContainer.appendChild(updateButton);
        updateForm.appendChild(updateContainer);

        return updateForm;
    },
    appendCardToColumn(accordionBody, cardDiv, cardStatusId) {
        const column = htmlSelectors.getColumn(accordionBody, cardStatusId);
        column.appendChild(cardDiv);
    },
    async appendNewCardToColumn(columnId, card) {
        const cardDiv = dom.createCard(card);
        const boardAccBody = htmlSelectors.getAccordionBody(card.board_id);
        const cardsStatusColumnDiv = htmlSelectors.getColumn(boardAccBody, columnId);
        cardsStatusColumnDiv.appendChild(cardDiv);
        await drag_and_drop.init()
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
        modal.insertAdjacentHTML('afterbegin', components.plainHtml.getModalInputForm(labelText));
        modal.querySelector('#buttonCancel').remove();
        modal.querySelector('.flex-center-middle').setAttribute('class', "flex-add-card");

        const accBody = htmlSelectors.getAccordionBody(boardId);
        const column = htmlSelectors.getColumn(accBody, statusId).querySelector('div.addCard');
        modalouter.appendChild(modal)
        column.replaceWith(modalouter)
        const inputField = document.getElementById('input');
        inputField.focus();
        // inputField.select();
        const abortEv = () => {
            evHandler.abort.updateBoardOrColumn(() => {
                const newButton = dom.createAddCardButton(boardId, statusId);
                modalouter.replaceWith(newButton);
            })
        }
        inputField.addEventListener('focusout', abortEv);
        return modalouter;
    },
}

