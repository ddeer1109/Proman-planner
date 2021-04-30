import { dom } from "./dom.js";
// import { init_drag_drop } from "./drag_and_drop.js";

// This function is to initialize the application
function init() {
    // init data
    dom.init();
    // loads the boards to the screen
    dom.loadBoards();
    // dom.loadCards(1);
    // init_drag_drop()
}

init();
