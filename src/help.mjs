import $ from "jquery"
/**
 * @typedef {import("./index.mjs").App} App
 */

export class HelpPage {
    /** @type {App} */
    _app;
    /** @type {JQuery<HTMLDivElement>} */
    page;
    /** @type {JQuery<HTMLAnchorElement>} */
    nav;


    /**
     * @param {App} app 
     */
    constructor(app) {
        this._app = app;
        this.page = $("#page-help");
        this.nav = $("#nav-help");
    }

    open() {
        this.page
            .removeClass("d-none")
            .addClass("d-block");
        this.nav.addClass("active");
    }

    close() {
        this.nav.removeClass("active");
        this.page
            .removeClass("d-block")
            .addClass("d-none");
    }
}
