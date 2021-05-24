// import {htmlComponents} from "./dom";
import {dom} from "./dom.js";
import {dataHandler} from "./data_handler.js";
import {evHandler} from "./evHandler.js";

export const components = {
    updateSubmitButton: function() {
            const updateButton = document.createElement('button');
            updateButton.setAttribute('class', 'btn btn-success update-card');
            updateButton.id = "buttonSubmit";
            updateButton.insertAdjacentHTML('afterbegin', '<i class="fas fa-check"></i>');
            return updateButton;
        },
    board: {
        updateForm: function() {
            const updateForm = document.createElement('form')
            updateForm.setAttribute('class', 'flex-center-middle g-1 my-card-form')
            updateForm.setAttribute('method', 'put')
            return updateForm;
        },
        updateInput: function(currentValue) {
            const updateInput = document.createElement('input');
            updateInput.setAttribute('value', currentValue);
            updateInput.setAttribute('class', 'form-control update-card input-darkned');
            updateInput.setAttribute('id', 'input');
            return updateInput;
        },
        accordionHeader (headerId) {
            const  accordionHeader = document.createElement('h2')
            accordionHeader.setAttribute('class', 'accordion-header');
            accordionHeader.setAttribute('id', headerId);
            return accordionHeader;
            },
        accordionButton(boardTitle, collapseId) {
            const accordionButton = document.createElement('button');
            accordionButton.innerText = boardTitle;
            accordionButton.setAttribute('class', 'accordion-button collapsed');
            accordionButton.setAttribute('type', 'button');
            accordionButton.setAttribute('data-bs-toggle', 'collapse');
            accordionButton.setAttribute('data-bs-target', `#${collapseId}`);
            accordionButton.setAttribute('aria-expanded', `false`);
            accordionButton.setAttribute('aria-controls', collapseId);
            accordionButton.setAttribute('click-cooldown', 'false');
            return accordionButton;
        }
    },
    column: {
        content: function(boardId, status) {
            const statusContent = document.createElement('div');
            const buttonAddCard = dom.createAddCardButton(boardId, status.id);
            statusContent.appendChild(buttonAddCard)
            statusContent.setAttribute('class', 'column-content');
            statusContent.setAttribute('data-column', status.id);
            return statusContent;
        },
        newColumnButton: function (boardId) {
            const addColumnButton = document.createElement('button');
            addColumnButton.addEventListener('click', () => {
                dom.showAddColumnModal(boardId);
            });
            addColumnButton.setAttribute('class', 'btn btn-light');
            addColumnButton.innerText = "add column";
            return addColumnButton;
        },
        updateForm: function(callback){
            const updateForm = document.createElement('form');
            updateForm.setAttribute('class', 'flex-center-middle g-1 my-card-form')
            updateForm.setAttribute('method', 'put')
            updateForm.addEventListener('submit', callback)
            return updateForm;
        },
        updateInput: function(currentTitle, callback){
            const updateInput = document.createElement('input');
            updateInput.setAttribute('value', currentTitle);
            updateInput.setAttribute('class', 'form-control update-card');
            updateInput.setAttribute('id', 'input');
            updateInput.addEventListener("focusout", callback);
            return updateInput;
        },
        headerContainer(dbClickEv) {
            const headerContainer = document.createElement('div')
            headerContainer.setAttribute('class', 'column-header-container card');
            headerContainer.addEventListener('dblclick', dbClickEv)
            return headerContainer
        },
        deleteButton(boardId, status, column) {
            const btnDeleteColumn = document.createElement('button');
            btnDeleteColumn.setAttribute('class', 'btn btn-danger btn-sm button-card-delete')
            btnDeleteColumn.innerHTML = '<i class="fas fa-trash"></i>'
            btnDeleteColumn.addEventListener('click', () =>
                evHandler.removeColumn(boardId, status.id, column));
            return btnDeleteColumn;
        }
    },
    card: {
        updateForm(submitEvCallback) {
            const updateForm = document.createElement('form');
            updateForm.setAttribute('class', 'flex-center-middle g-1 my-card-form')
            updateForm.setAttribute('method', 'put')
            updateForm.addEventListener('submit', submitEvCallback)

            return updateForm;
        },
        updateInput(currentTitle, abortEv) {
            const updateInput = document.createElement('input');
            updateInput.setAttribute('value', currentTitle);
            updateInput.setAttribute('class', 'form-control update-card');
            updateInput.setAttribute('id', 'input');
            updateInput.addEventListener("focusout", abortEv)

            return updateInput;
        },
    },
    plainHtml: {
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
}


