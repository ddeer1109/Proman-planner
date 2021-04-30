export const drag_and_drop = {
    cards: document.querySelectorAll("[draggable='true']"),
    cols: document.querySelectorAll('.column-content'),
    // currentCard: null,
    // dragOverCard: null,

    init: function () {
        // const cards = document.querySelectorAll("[draggable='true']");
        // const cols = document.querySelectorAll('.column-content');
       let currentCard = null;
       let dragOverCard = null;
    // let mousePosition = 0;
        this.refreshCardState();
        this.refreshColumState();
        // console.log(this.cards);

        for(let card of this.cards) {
            card.addEventListener('dragstart', dragStart);
            card.addEventListener('dragend', dragEnd);
            card.addEventListener('dragenter', dragEnterCard)
            card.addEventListener('dragleave', dragLeaveCard)
        }

        for(let col of this.cols) {
            col.addEventListener('dragover', dragOver);
            col.addEventListener('dragenter', dragEnter);
            col.addEventListener('dragleave', dragLeave);
            col.addEventListener('drop', dragDrop);
        }

        function dragEnterCard(e) {
            e.preventDefault();
            dragOverCard = e.target;
            dragOverCard.classList.add('hovered');
            // console.log('dragEnterCard: ', dragOverCard)
        }

        function dragLeaveCard(e) {
            e.preventDefault();
            if(dragOverCard != null) {
                dragOverCard.classList.remove('hovered');
                dragOverCard = null;
            }
            // console.log('dragLeaveCard: ', dragOverCard)

        }

        function dragOver(e) {
            e.preventDefault();
        }

        function dragEnter(e) {
            e.preventDefault();
            this.className = 'column-content hovered';
        }

        function dragLeave(e) {
            this.className = 'column-content';
        }

        function dragDrop(evt) {
            console.log('dragDrop')
            console.log(currentCard);
            this.className = 'column-content';

            if(dragOverCard != null) {
                // setCurrentCard(dragOverCard, currentCard);

                dragOverCard.insertAdjacentElement('beforebegin', currentCard);
                dragOverCard.classList.remove('hovered')
                dragOverCard = null;
            } else {
                this.append(currentCard)
            }

            currentCard = null;
        }

        function dragStart(evt) {
            currentCard = evt.target;
            console.log(currentCard);

            this.className += ' hold';
            setTimeout(() => {
                this.className = 'invisible';
            }, 0);
        }

        function dragEnd(evt) {
            this.className = 'card';
            // dragOverCard.classList.remove('hovered')
        }
},
    refreshCardState: function () {
        this.cards = document.querySelectorAll("[draggable='true']");
        // this.init();
    },
    refreshColumState: function () {
        this.cols = document.querySelectorAll('.column-content');
    }
}

