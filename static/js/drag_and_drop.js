import { dataHandler } from "./data_handler.js";
export const drag_and_drop = {
    // cards: document.querySelectorAll("[draggable='true']"),
    // cols: document.querySelectorAll('.column-content'),

    currentCard: null,
    dragOverCard: null,
    cards: null,
    cols: null,


    init: function() {

        this.cards = document.querySelectorAll("[draggable='true']");
        this.cols = document.querySelectorAll('.column-content');
        // console.log(this.cards, "cards")
        // console.log(this.cols, "cards")
        drag_and_drop.removeListeners();
        for (let card of drag_and_drop.cards) {
            card.addEventListener('dragstart', drag_and_drop.dragStartCard);
            card.addEventListener('dragend', drag_and_drop.dragEndCard);
            card.addEventListener('dragenter', drag_and_drop.dragEnterCard)
            card.addEventListener('dragleave', drag_and_drop.dragLeaveCard)
            card.addEventListener('drop', drag_and_drop.dropCardEv);

        }

        for(let col of drag_and_drop.cols) {
            col.addEventListener('dragover', drag_and_drop.dragOver);
            col.addEventListener('dragenter', drag_and_drop.dragEnter);
            col.addEventListener('dragleave', drag_and_drop.dragLeave);
            col.addEventListener('drop', drag_and_drop.dropCardColEv);
        }
    },

    dragStartCard: function dragStart(evt) {
        drag_and_drop.currentCard = evt.target;

        evt.target.classList.add('hold');
        setTimeout(() => {
            this.className = 'invisible';
            console.log("blabla 11111111!")
        }, 0);
        console.log("blabla !!!")
    },

    dragEndCard: function dragEnd(evt) {
        evt.target.className = 'card';
    },

    dragEnterCard: function dragEnterCard(e) {
        e.preventDefault();
        drag_and_drop.dragOverCard = e.target;
    },

    dragLeaveCard: function dragLeaveCard(e) {
        e.preventDefault();
        if(drag_and_drop.dragOverCard != null) {
            drag_and_drop.dragOverCard = null;
        }

    },
    dragOver: function dragOver(e) {
        e.preventDefault();
    },

    dragEnter: function dragEnter(e) {
        e.preventDefault();
    },
    dragLeave: function dragLeave(e) {
        // console.log('column-content checker - e.target', e.target)
    },

    dragDrop: function (evt) {
        return new Promise(((resolve, reject) => {
            if (!evt.target.className.includes('card')) {
                evt.target.append(drag_and_drop.currentCard)
                let colStatusContent = evt.target;
                console.log(colStatusContent)
                resolve(colStatusContent.getAttribute('data-column'))
            }
        }))
    },
    dropCard(evt) {
        return new Promise(((resolve, reject) => {
            drag_and_drop.dragOverCard.insertAdjacentElement('beforebegin', drag_and_drop.currentCard);
            drag_and_drop.dragOverCard = null;
            let colStatusContent = evt.target.parentNode;
            resolve(colStatusContent.getAttribute('data-column'))
        }))
        // drag_and_drop.dragOverCard.insertAdjacentElement('beforebegin', drag_and_drop.currentCard);
        // drag_and_drop.dragOverCard = null;
        // let colStatusContent = evt.target.parentNode;
    },
    refreshCardsIndexesInDataBase(columnId) {
        setTimeout(() => {
            let currentStatusContent = document.querySelectorAll(`.column-content[data-column="${columnId}"] .card`)
            let cardsIds = [...currentStatusContent].map((el) => el.getAttribute('data-card'));

            let jsonDataObject = {status_id: columnId, cards_ids: cardsIds};

            console.log(jsonDataObject, 'current content');
            dataHandler.updateCardsIndexes(jsonDataObject, () => {
                console.log('success');
            })
        }, 0)
    },
    dropCardEv(evt) {
            drag_and_drop.dropCard(evt)
                .then((response) => drag_and_drop.refreshCardsIndexesInDataBase(response))
                .catch((err) => console.log(err, 'err'));

    },
    dropCardColEv(evt) {
            drag_and_drop.dragDrop(evt)
                .then((response) => drag_and_drop.refreshCardsIndexesInDataBase(response))
                .catch((err) => console.log(err, 'err'));
    },
    removeListeners() {
        for (let card of drag_and_drop.cards) {
            card.removeEventListener('dragstart', drag_and_drop.dragStartCard);
            card.removeEventListener('dragend', drag_and_drop.dragEndCard);
            card.removeEventListener('dragenter', drag_and_drop.dragEnterCard)
            card.removeEventListener('dragleave', drag_and_drop.dragLeaveCard)
            card.removeEventListener('drop', drag_and_drop.dropCardEv);

        }
        for(let col of drag_and_drop.cols) {
            col.removeEventListener('dragover', drag_and_drop.dragOver);
            col.removeEventListener('dragenter', drag_and_drop.dragEnter);
            col.removeEventListener('dragleave', drag_and_drop.dragLeave);
            col.removeEventListener('drop', drag_and_drop.dropCardColEv);
        }
    }
}

// add data-index to card
// on dropping card iterate over cards giving index from 0 to X
// update indexes of cards in column
// update status_id of dropped card
