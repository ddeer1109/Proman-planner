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
            console.log("data - > ", dataHandler._data)
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
        }, 1000)

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
        this.accordionItem.setAttribute('class', `accordion-item board${board.id}`);

        this.accordionHeader = document.createElement('h2');
        dom.setAccordionHeaderAttributes();

        this.accordionButton = document.createElement('button');
        dom.setAccordionButtonAttributes();
        this.accordionButton.addEventListener('click', () =>
            dom.processAccordionItemExpanding(board.id)
        );
        this.accordionCollapseBody = document.createElement('div');
        dom.setAccordionCollapseBody();

        this.accordionHeader.appendChild(this.accordionButton);
        this.accordionItem.appendChild(this.accordionHeader);
        this.accordionItem.appendChild(this.accordionCollapseBody);
        return this.accordionItem;
    },
    // here comes more features
    initBoardColumnsRenderPromise(boardId) {
        const accBody = htmlSelectors.getAccordionBody(boardId);
        accBody.innerHTML = ""
        return new Promise(resolve => {
            dataHandler.getBoardsStatuses(boardId, function (boardStatuses) {
                console.log('board statuses 11111 -', boardStatuses)
                dom.createStatusesColumns(accBody, boardStatuses);
                resolve();
            });
        });
    },

    createStatusesColumns(accBody, boardStatuses) {

        for (let status of boardStatuses) {
                const colDiv = document.createElement('div');

                const statusTitle = document.createElement('h4');
                statusTitle.innerText = status.title;
                colDiv.classList.add(`status-column`);
                colDiv.setAttribute('data-column', status.id);
                colDiv.appendChild(statusTitle);


                const statusContent = document.createElement('div');
                statusContent.setAttribute('class', 'column-content');
                colDiv.appendChild(statusContent);
                accBody.appendChild(colDiv);
                // console.log(accBody, "status column")
            // }
        }
    },
    setAccordionHeaderAttributes() {
        this.accordionHeader.setAttribute('class', 'accordion-header');
        this.accordionHeader.setAttribute('id', this.headerId);
    },
    setAccordionButtonAttributes() {
        this.accordionButton.innerText = `${this.board.title}`;
        this.accordionButton.setAttribute('class', 'accordion-button collapsed');
        this.accordionButton.setAttribute('type', 'button');
        this.accordionButton.setAttribute('data-bs-toggle', 'collapse');
        this.accordionButton.setAttribute('data-bs-target', `#${this.collapseId}`);
        this.accordionButton.setAttribute('aria-expanded', `false`);
        this.accordionButton.setAttribute('aria-controls', this.collapseId);
        this.accordionButton.setAttribute('click-cooldown', 'false');
    },
    processAccordionItemExpanding(board_id) {

        if (this.accordionButton.classList.value.includes('collapsed')
            && (this.accordionButton.getAttribute('click-cooldown') != 'true')) {
            this.accordionButton.setAttribute('click-cooldown', "true");
            dom.loadBoardContent(board_id);
            setTimeout(() => {
                this.accordionButton.removeAttribute('click-cooldown');
            }, 1000)
        };
    },
    createAddBoardButton() {
        const pageHeader = document.getElementById('page-title');
        const addingButton = document.createElement('button');
        addingButton.innerText = "Add board";
        addingButton.setAttribute('class', 'btn btn-success');
        addingButton.addEventListener('click', dom.showAddBoardModal)
        pageHeader.insertAdjacentElement('afterend', addingButton);
    },
    showAddBoardModal() {
        const modal = document.createElement('div');
        modal.setAttribute('class', 'display-modal');
        modal.insertAdjacentHTML('afterbegin', dom.getModalInputForm());
        document.body.appendChild(modal);

        const cancelButton = document.getElementById('buttonCancel');
        cancelButton.addEventListener('click', modal.remove)

        const form = document.getElementById('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputValue = document.getElementById('input').value;
            dataHandler.createNewBoard({'title': inputValue}, dom.loadBoards);
            modal.remove();
        });
    },
    getModalInputForm() {
        return `
        <div class="container-modal-form">
            <form id="form" class="row g-3" method="post">
                <div class="col">
                    <label for="inputTitle" class="text-light">Title</label>
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

    setAccordionCollapseBody() {
        this.accordionCollapseBody.setAttribute('id', this.collapseId);
        this.accordionCollapseBody.setAttribute('class', "accordion-collapse collapse");
        this.accordionCollapseBody.setAttribute('aria-labelledby', this.headerId);
        this.accordionCollapseBody.setAttribute('data-bs-parent', `#accordionContainer`);

        const accordionBody = document.createElement('div');
        accordionBody.setAttribute('class', 'accordion-body container d-flex justify-content-around');
        accordionBody.setAttribute('data-board', `${this.board.id}`);
        this.accordionCollapseBody.appendChild(accordionBody);
    }
};
