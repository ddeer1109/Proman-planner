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
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function(boards) {

            dom.showBoards(boards);

            // console.log(boards);
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        const pageContainer = document.getElementById('boards');
        const accordion = dom.createAccordion(boards);
        // console.log('container', pageContainer.innerHTML);

            // pageContainer.replaceChild(accordion, pageContainer.firstChild);
        setTimeout(()=>{
            pageContainer.innerHTML = "";
            pageContainer.appendChild(accordion);
        }, 1000)

    },
    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
        // console.log(dataHandler._data);
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            const accBody = htmlSelectors.getAccordionBody(boardId);
            // const cardsStatusesIds = cards.map(card => card.status_id);

            dataHandler.getBoard(boardId, function (board) {
                dom.createStatusesColumns(accBody, board.statuses);
            });


            console.log(dataHandler._data)

            const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
            wait(100).then(() => {
                console.log('success')
                dom.showCards(cards, accBody)
            });
        });
    },
    showCards: function (cards, accBody) {
        for (let card of cards) {
            const cardNew = document.createElement('div');
            cardNew.setAttribute('class', 'card');
            cardNew.setAttribute('data-card', `${card.id}`);
            cardNew.innerText = card.title;
            htmlSelectors.getColumn(accBody, card.status_id).appendChild(cardNew);
        };

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
        const headerId = `heading${board.id}`;
        const collapseId = `collapse${board.id}`;

        const accordionItem = document.createElement('div');
        accordionItem.setAttribute('class', `accordion-item board${board.id}`);

        const accordionHeader = document.createElement('h2');
        accordionHeader.setAttribute('class', 'accordion-header');
        accordionHeader.setAttribute('id', headerId);

        const accordionButton = document.createElement('button');
        accordionButton.innerText = `${board.title}`
        accordionButton.setAttribute('class', 'accordion-button collapsed');
        accordionButton.setAttribute('type', 'button');
        accordionButton.setAttribute('data-bs-toggle', 'collapse');
        accordionButton.setAttribute('data-bs-target', `#${collapseId}`);
        accordionButton.setAttribute('aria-expanded', `true`);
        accordionButton.setAttribute('aria-controls', `${collapseId}`);
        accordionButton.addEventListener('click', () => {
            if (!accordionButton.classList.value.includes('collapsed')) {
                dom.loadCards(board.id);
            };
        });
        accordionHeader.appendChild(accordionButton);
        accordionItem.appendChild(accordionHeader);

        const collapseArea = document.createElement('div');
        collapseArea.setAttribute('id', collapseId);
        collapseArea.setAttribute('class', "accordion-collapse collapse");
        collapseArea.setAttribute('aria-labelledby', headerId);
        collapseArea.setAttribute('data-bs-parent', `#accordionContainer`);


        const accordionBody = document.createElement('div');
        accordionBody.setAttribute('class', 'accordion-body container d-flex justify-content-around');
        accordionBody.setAttribute('data-board', `${board.id}`);
        accordionBody.appendChild(document.createElement('div'));
        collapseArea.appendChild(accordionBody);

        accordionItem.appendChild(collapseArea);
        return accordionItem;
    },
    // here comes more features
    createStatusesColumns(accBody, boardStatuses) {
        console.log(boardStatuses, '===> statuses')

        accBody.innerHTML = "";
        dataHandler.getStatuses(function(statuses) {
            const boardStatusesObject = statuses.filter(status => boardStatuses.includes(status.id) )

            // console.log(boardStatusesObject, 'boardstatusesobject')

            for (let status of boardStatusesObject) {
                    console.log(status, '> single status')

                // if (boardStatusesIds.includes(status.id)) {
                //     // console.log('status', status);
                    const colDiv = document.createElement('div');
                    colDiv.classList.add(`status-column`);
                    colDiv.setAttribute('data-column', status.id);
                    const statusTitle = document.createElement('h4');
                    statusTitle.innerText = status.title;
                    colDiv.appendChild(statusTitle);
                    const statusContent = document.createElement('div');
                    statusContent.setAttribute('class', 'column-content');
                    colDiv.appendChild(statusContent);
                    accBody.appendChild(colDiv);
                // }
            }
        });

    },

};
