// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let htmlSelectors = {
    getBoardById(boardId) {
        return document.querySelector(`.board${boardId}`);
    },
    getBoardColumnOfStatus(boardId, statusId) {
        // return document.querySelector(`.accordion-item.board${boardId} div#collapse${boardId} div.accordion-body`);
        return document.querySelector(`div[data-board="${boardId}"] .row .col.status${statusId} .column-content`);
    },
    getBoardsColumns(boardId) {
        return htmlSelectors.getBoardById(boardId).querySelector('.row').childNodes;
    },
    getAccordionBody(boardId) {
        return document.querySelector(`div[data-board="${boardId}"]`);
    },
    getAccordionContainer() {
      return document.getElementById('accordionContainer');
    },
    getColumn(accBody, statusId) {
        // console.log(`#${boardId}${statusId}, id`);
        // return document.getElementById(`${boardId}${statusId}`);
        return accBody.querySelector(`div.status-column[data-column="${statusId}"] .column-content`)
    },

};


export let dom = {
    accordionContainer: null,
    init: function () {
        // This function should run once, when the page is loaded.
        dataHandler.init();
        dom.createAddBoardButton();
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function(boards) {
            dom.showBoards(boards);
            // console.log("data - > ", dataHandler._data)
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        const pageContainer = document.getElementById('boards');
        const accordion = dom.createAccordion(boards);
        // console.log('container', pageContainer.innerHTML);

            // pageContainer.replaceChild(accordion, pageContainer.firstChild);
        setTimeout(() => {
            pageContainer.innerHTML = "";
            pageContainer.appendChild(accordion);
        }, 10)
    },
    loadBoardContent: function (boardId) {
        // retrieves cards and makes showCards called
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.initBoardColumnsRenderPromise(boardId)
                .then(() => {
                        dom.showCards(cards)
                })
        });
    },
    showCards: function (cards) {
        if (cards.length != 0) {
            const accBody = htmlSelectors.getAccordionBody(cards[0].board_id);
            for (let card of cards) {
                const cardNew = dom.createCard(card);
                dom.appendCardToColumn(accBody, cardNew, card.status_id);
            };
        }
    },
    createCard(card) {
        const cardDiv = document.createElement('div');
        cardDiv.setAttribute('class', 'card');
        cardDiv.setAttribute('data-card', `${card.id}`);
        cardDiv.innerText = card.title;

        const buttonDelete = document.createElement('button')
        buttonDelete.setAttribute('class', 'btn btn-danger btn-sm button-card-delete')
        const trashIcon = document.createElement('i');
        trashIcon.setAttribute('class', 'fas fa-trash')
        buttonDelete.appendChild(trashIcon);
        buttonDelete.addEventListener('click', () => {
            dom.deleteCard(cardDiv, card.id);
        });
        cardDiv.appendChild(buttonDelete);
        return cardDiv;
    },
    appendCardToColumn(accordionBody, cardDiv, cardStatusId) {
        const column = htmlSelectors.getColumn(accordionBody, cardStatusId);
        column.appendChild(cardDiv);
    },
    deleteCard(card, card_id) {
        dataHandler.deleteCard(card_id, () => {
            card.remove()
        })
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
    addNewBoardToContainer(newBoard) {
        const accItem = dom.createAccordionItem(newBoard);
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

        this.accordionItem.setAttribute('class', `accordion-item board${board.id}`);
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
    // here comes more features
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

        const addColumnDiv = document.createElement('div');
        addColumnDiv.setAttribute('class', "add-col-btn")

        const addColumnButton = document.createElement('button');
        const boardId = this.board.id;
        addColumnButton.addEventListener('click', () => {
            dom.showAddColumnModal(boardId);
        });
        addColumnButton.setAttribute('class', 'btn btn-light');
        addColumnButton.innerText = "Add column";
        addColumnDiv.appendChild(addColumnButton);

        const accordionBody = document.createElement('div');
        // accordionBody.setAttribute('class', 'accordion-body container flex-center-middle');
        accordionBody.setAttribute('class', 'accordion-body container');
        accordionBody.setAttribute('data-board', `${this.board.id}`);
        this.accordionCollapseBody.appendChild(accordionBody);
        this.accordionCollapseBody.appendChild(addColumnDiv);
    },
    processAccordionItemExpanding(board_id, accordionButton) {
        accordionButton.setAttribute('disabled', 'true');

        dom.loadBoardContent(board_id);
        setTimeout(() => {
            accordionButton.removeAttribute('disabled');
        }, 1000)
    },
    createStatusesColumns(accBody, boardStatuses) {
        const boardId = parseInt(accBody.getAttribute('data-board'))

        // add status-columns
        for (let status of boardStatuses) {
                const colDiv = dom.createStatusColumn(boardId, status)
                accBody.appendChild(colDiv);
        }
    },
    createStatusColumn(boardId, status) {
        const colDiv = document.createElement('div');
        const statusTitle = document.createElement('h4');
        const statusContent = document.createElement('div');
        const buttonAddCard = dom.createAddCardButton(boardId, status.id)

        statusContent.appendChild(buttonAddCard)
        statusTitle.innerText = status.title;
        statusContent.setAttribute('class', 'column-content');

        colDiv.classList.add(`status-column`);
        colDiv.setAttribute('data-column', status.id);
        colDiv.appendChild(statusTitle);
        colDiv.appendChild(statusContent);

        return colDiv;
    },
    createAddBoardButton() {
        const pageHeader = document.getElementById('page-title');
        const addingButton = document.createElement('button');
        addingButton.innerText = "Add board";
        addingButton.setAttribute('class', 'btn btn-light m-1');
        addingButton.addEventListener('click', dom.showAddBoardModal)
        pageHeader.insertAdjacentElement('afterend', addingButton);
    },
    // TODO - to refactor
    showAddBoardModal() {
        const modal = dom.createModalDiv('Board title: ');
        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputValue = document.getElementById('input').value;
            dataHandler.createNewBoard({'title': inputValue}, (newBoard) => {
                dom.addNewBoardToContainer(newBoard);
            });
            modal.remove();
        });
    },
    // TODO - to refactor
    showAddColumnModal(boardId) {
        const modal = dom.createAddColumnModal('Column name: ', boardId);
        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputField = document.getElementById('input');
            dataHandler.createNewColumn({'title': inputField.value, 'boardId': boardId}, (newColumn) => {
                dom.appendColumnToBoard(boardId, newColumn);
                modal.replaceWith(dom.createAddColumnButton(boardId));
            });
        });
    },
    // TODO - to refactor
    showAddCardModal(boardId, columnId) {
        const modal = dom.createAddCardModal("Card title: ", boardId, columnId);
        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputValue = document.getElementById('input').value;
            const dataObject = {'title': inputValue, 'board_id': boardId, 'status_id': columnId};
            dataHandler.createNewCard(dataObject, (card) => {
                const button = dom.createAddCardButton(boardId, columnId);
                modal.replaceWith(button);
                dom.appendNewCardToColumn(boardId, columnId, card);
            })
        });
    },
    getModalInputForm(labelText) {
        return `
            <form id="form" class="flex-center-middle g-1" method="post">
                <div class="flex-center-middle">
                    <div class="">
                        <label for="inputTitle" class="text-light">${labelText}</label>
                        <input id="input" type="text" class="form-control" id="inputTitle">
                    </div>  
                    <div class="">
                        <button id="buttonSubmit" type="submit" class="btn btn-success">Confirm</button>
                        <button id="buttonCancel" type="button" class="btn btn-warning">Cancel</button>
                    </div>
                </div>
            </form>
        `
    },
    createModalDiv(labelText) {
        const modal = document.createElement('div');
        const formContainer = document.createElement('div');
        modal.insertAdjacentHTML('afterbegin', dom.getModalInputForm(labelText));
        formContainer.setAttribute('class', 'container-modal-form display-modal');
        formContainer.appendChild(modal);
        document.body.appendChild(formContainer);
        const cancelButton = document.getElementById('buttonCancel');
        const inputField = document.getElementById('input');
        inputField.select();
        inputField.focus();

        inputField.addEventListener('focusout', () => {
            formContainer.remove();
        });

        cancelButton.addEventListener('click', () => {
            formContainer.remove();
        });
        return modal;
    },

    createAddColumnModal(labelText, boardId) {
        const modal = document.createElement('div');
        modal.insertAdjacentHTML('afterbegin', dom.getModalInputForm(labelText));
        modal.querySelector('#buttonCancel').remove();
        htmlSelectors.getAccordionBody(boardId).nextSibling.firstChild.replaceWith(modal);
        const inputField = document.getElementById('input');
        inputField.focus();
        inputField.select();
        inputField.addEventListener('focusout', () => {
            setTimeout(() => {
                modal.replaceWith(dom.createAddColumnButton(boardId))
            }, 100)
        });
        return modal;
    },
    createAddCardModal(labelText, boardId, statusId) {
        const modalouter = document.createElement('div');
        const modal = document.createElement('div');
        modal.setAttribute('class', "add-card-modal");
        modalouter.style.height = "40px" ;
        modal.insertAdjacentHTML('afterbegin', dom.getModalInputForm(labelText));
        modal.querySelector('#buttonCancel').remove();
        modal.querySelector('label').remove();
        modal.querySelector('.flex-center-middle').setAttribute('class', "flex-add-card");
        const accBody = htmlSelectors.getAccordionBody(boardId);
        const column = htmlSelectors.getColumn(accBody, statusId).querySelector('button.btn');
        modalouter.appendChild(modal)
        column.replaceWith(modalouter)

        const swoosh = document.createElement('i');
        swoosh.setAttribute('class', "fas fa-check");
        const button = modal.querySelector("#buttonSubmit");
        button.innerText = '';
        button.appendChild(swoosh);

        const inputField = document.getElementById('input');
        inputField.focus();
        inputField.select();
        inputField.addEventListener('focusout', () => {
            const newButton = dom.createAddCardButton(boardId, statusId);
            console.log('modalouter', modalouter)
            setTimeout(() => {
                modalouter.replaceWith(newButton);
            }, 100)
        });
        return modalouter;
    },
    appendColumnToBoard(boardId, newColumn) {
        const columnDiv = dom.createStatusColumn(boardId, newColumn);
        const boardAccBody = htmlSelectors.getAccordionBody(boardId);
        boardAccBody.appendChild(columnDiv);
        console.log("add column", columnDiv);
    },
    appendNewCardToColumn(boardId, columnId, card) {
        const cardDiv = dom.createCard(card);
        const boardAccBody = htmlSelectors.getAccordionBody(boardId);
        const cardsStatusColumnDiv = htmlSelectors.getColumn(boardAccBody, columnId);
        cardsStatusColumnDiv.appendChild(cardDiv);
    },
    createAddColumnButton(boardId) {
        const addColumnButton = document.createElement('button');
        addColumnButton.addEventListener('click', () => {
            dom.showAddColumnModal(boardId);
        });
        addColumnButton.setAttribute('class', 'btn btn-light');
        addColumnButton.innerText = "Add column";
        return addColumnButton;
    },

    createAddCardButton(boardId, statusId) {
        const buttonAddCard = document.createElement('button')

        buttonAddCard.setAttribute('class', 'btn btn-primary btn-sm');
        buttonAddCard.innerText = 'Add Card';
        buttonAddCard.style.width = '100%';

        buttonAddCard.addEventListener('click', () => {
            dom.showAddCardModal(boardId, statusId);
        })
        return buttonAddCard;
    }
};
