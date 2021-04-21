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
    getColumn(accBody, statusId) {
        // console.log(`#${boardId}${statusId}, id`);
        // return document.getElementById(`${boardId}${statusId}`);
        return accBody.querySelector(`div.status-column[data-column="${statusId}"] .column-content`)
    }

};


export let dom = {
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
                const cardNew = document.createElement('div');
                cardNew.setAttribute('class', 'card');
                cardNew.setAttribute('data-card', `${card.id}`);
                cardNew.innerText = card.title;

                const buttonDelete = document.createElement('button')
                buttonDelete.setAttribute('class', 'btn btn-danger btn-sm button-card-delete')
                buttonDelete.innerText = 'Delete'
                buttonDelete.addEventListener('click', () => {
                    dataHandler.deleteCard(card.id, () => {
                        cardNew.remove()
                    })
                })
                cardNew.appendChild(buttonDelete);

                const column = htmlSelectors.getColumn(accBody, card.status_id);
                column.appendChild(cardNew);
            };
        }
    },
    createAccordion: function (boards) {
        const accordionContainer = document.createElement('div');
        accordionContainer.setAttribute('class', 'accordion');
        accordionContainer.setAttribute('id', 'accordionContainer');
        for (let board of boards) {
            const accItem = dom.createAccordionItem(board);
            accordionContainer.appendChild(accItem);
        }
        return accordionContainer;
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

    createStatusesColumns(accBody, boardStatuses) {
        const boardId = parseInt(accBody.getAttribute('data-board'))

        // add status-columns
        for (let status of boardStatuses) {
                const colDiv = document.createElement('div');
                const statusTitle = document.createElement('h4');
                const statusContent = document.createElement('div');

                const buttonAddCard = document.createElement('button')
                buttonAddCard.setAttribute('class', 'btn btn-primary btn-sm');
                buttonAddCard.innerText = 'Add Card';
                buttonAddCard.style.width = '100%';

                buttonAddCard.addEventListener('click', () => {
                    dom.showAddCardModal(boardId, status.id);
                })


                statusContent.appendChild(buttonAddCard)
                statusTitle.innerText = status.title;
                statusContent.setAttribute('class', 'column-content');

                colDiv.classList.add(`status-column`);
                colDiv.setAttribute('data-column', status.id);

                colDiv.appendChild(statusTitle);
                colDiv.appendChild(statusContent);

                accBody.appendChild(colDiv);
        }
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
            dataHandler.createNewBoard({'title': inputValue}, dom.loadBoards);
            modal.remove();
        });
    },
    // TODO - to refactor
    showAddColumnModal(boardId) {
        const modal = dom.createModalDiv('Column name: ');
        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputValue = document.getElementById('input').value;
            dataHandler.createNewColumn({'title': inputValue, 'boardId': boardId}, () => {
                modal.remove();
                dom.loadBoardContent(boardId);
            });
        });
    },
    // TODO - to refactor
    showAddCardModal(boardId, columnId) {
        const modal = dom.createModalDiv('Card name: ');
        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputValue = document.getElementById('input').value;
            dataHandler.createNewCard({'title': inputValue, 'board_id': boardId, 'status_id': columnId}, () => {
                modal.remove();
                dom.loadBoardContent(boardId)
            })
        });
    },
    getModalInputForm(labelText) {
        return `
        <div class="container-modal-form">
            <form id="form" class="row g-3" method="post">
                <div class="col">
                    <label for="inputTitle" class="text-light">${labelText}</label>
                    <input id="input" type="text" class="form-control" id="inputTitle">
                </div>  
            <div class="row g-3">
                <div class="col flex-center-middle">
                    <button id="buttonSubmit" type="submit" class="btn btn-success m-3">Confirm</button>
                    <button id="buttonCancel" type="button" class="btn btn-warning m-3">Cancel</button>
                </div>
            </div>
            </form>
        </div>
        `
    },
    createModalDiv(labelText) {
        const modal = document.createElement('div');
        modal.setAttribute('class', 'display-modal');
        modal.insertAdjacentHTML('afterbegin', dom.getModalInputForm(labelText));
        document.body.appendChild(modal);

        const cancelButton = document.getElementById('buttonCancel');
        // console.log(cancelButton, "cancel button");
        cancelButton.addEventListener('click', () => {
            // console.log(modal, "modal");
            modal.remove()
        });
        return modal;
    },

};
