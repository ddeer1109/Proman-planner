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
        console.log(this.cards, "cards")
        console.log(this.cols, "cards")

        for (let card of drag_and_drop.cards) {
            card.addEventListener('dragstart', drag_and_drop.dragStartCard);
            card.addEventListener('dragend', drag_and_drop.dragEndCard);
            card.addEventListener('dragenter', drag_and_drop.dragEnterCard)
            card.addEventListener('dragleave', drag_and_drop.dragLeaveCard)
            card.addEventListener('drop', drag_and_drop.dropCard);

        }

        for(let col of drag_and_drop.cols) {
            col.addEventListener('dragover', drag_and_drop.dragOver);
            col.addEventListener('dragenter', drag_and_drop.dragEnter);
            col.addEventListener('dragleave', drag_and_drop.dragLeave);
            col.addEventListener('drop', drag_and_drop.dragDrop);
        }

    },

    dragStartCard: function dragStart(evt) {
        drag_and_drop.currentCard = evt.target;

        evt.target.classList.add('hold');
        setTimeout(() => {
            this.className = 'invisible';
        }, 0);
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
        console.log('column-content checker - e.target', e.target)
    },

    dragDrop: function (evt) {
        if (!evt.target.className.includes('card')) {
            console.log("DRAG AND DROP", evt.target);
            evt.target.append(drag_and_drop.currentCard)
        }
    },
    dropCard(evt) {
        console.log("DRAG AND DROP CARD", evt.target);
        drag_and_drop.dragOverCard.insertAdjacentElement('beforebegin', drag_and_drop.currentCard);
        drag_and_drop.dragOverCard.classList.remove('hovered')
        drag_and_drop.dragOverCard = null;
    }
}

