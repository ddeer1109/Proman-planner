// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
        dataHandler.init();
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {

            dom.showBoards(boards);

            // console.log(boards);
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        const pageContainer = document.getElementById('boards');
        pageContainer.innerText = "";
        const accordion = dom.createAccordion(boards);
        console.log(dataHandler._data.statuses);
        // const statues =
        pageContainer.appendChild(accordion);


    },
    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
        // console.log(dataHandler._data);
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            console.log(cards);
            // dom.showCards();
        });
        console.log(boardId)
    },
    showCards: function (cards) {
        // console.log(dataHandler._data['boards'], 'to');
        // console.log(cards, 'asd');
        // shows the cards of a board
        // it adds necessary event listeners also
    },

    createAccordion: function (boards) {
        const accordionContainer = document.createElement('div');
        accordionContainer.setAttribute('class', 'accordion');
        accordionContainer.setAttribute('id', 'accordionContainer');
        for (let board of boards) {
            const accItem = dom.createAccordionItem(board);
            const accBody = accItem.querySelector('.accordion-collapse .accordion-body');

            const statusesColumns = dom.createStatusesColumns();
            accBody.appendChild(statusesColumns);
            accordionContainer.appendChild(accItem);
            // console.log(accBody);
        }
        return accordionContainer;
    },
    createAccordionItem: function (board) {
        const headerId = `heading${board.id}`;
        const collapseId = `collapse${board.id}`;

        const accordionItem = document.createElement('div');
        accordionItem.setAttribute('class', 'accordion-item');

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
            dom.loadCards(board.id);
        })
        accordionHeader.appendChild(accordionButton);
        accordionItem.appendChild(accordionHeader);

        const collapseArea = document.createElement('div');
        collapseArea.setAttribute('id', collapseId);
        collapseArea.setAttribute('class', "accordion-collapse collapse");
        collapseArea.setAttribute('aria-labelledby', headerId);
        collapseArea.setAttribute('data-bs-parent', `#accordionContainer`);


        const accordionBody = document.createElement('div');
        accordionBody.setAttribute('class', 'accordion-body container');
        collapseArea.appendChild(accordionBody);

        accordionItem.appendChild(collapseArea);
        return accordionItem;
    },
    // here comes more features
    createStatusesColumns() {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        console.log(dataHandler._data['statuses']);
        for (let rec of dataHandler._data['statuses']) {
            const statusCol = document.createElement('div');
            statusCol.innerText = rec.title;
            statusCol.setAttribute('class', `col status${rec.id}`);
            statusCol.setAttribute('data-status', `${rec.id}`);
            rowDiv.appendChild(statusCol);
        };
        return rowDiv
    }
};
