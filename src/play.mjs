import $ from "jquery"

/**
 * @typedef {import("./index.mjs").App} App
 */

export class PlayPage {
    /** @type {App} */
    _app;
    /** @type {JQuery<HTMLDivElement>} */
    page;
    /** @type {JQuery<HTMLAnchorElement>} */
    nav;

    /** @type {JQuery<HTMLDivElement>} */
    player_stats_list;

    /**
     * @param {App} app 
     */
    constructor(app) {
        this._app = app;
        this.page = $("#page-play");
        this.nav = $("#nav-play");

        this.player_stats_list = $('#play-player-attributes');
    }

    open() {
        this.page
            .removeClass("d-none")
            .addClass("d-block");
        this.nav.addClass("active");

        this.build_player_stats();
    }

    close() {
        this.nav.removeClass("active");
        this.page
            .removeClass("d-block")
            .addClass("d-none");
    }


    /**
     * @param {jQuery<HTMLDivElement>} list 
     * @param {string} key
     * @param {function} reduce_listener 
     * @param {string} name 
     * @param {number} val 
     * @param {function} val_change_listener
     * @param {function} increase_listener
     */
    create_stat_row(list, key, reduce_listener, name, val, val_change_listener, increase_listener) {
        list.append(
            $("<div />").data("stat_key", key.toString())
                .addClass("input-group").addClass("mb-2")
                .append($("<span />")
                    .text(name).addClass("w-50")
                    .addClass("input-group-text")
                )
                .append($("<button />")
                    .attr("type", "button").text("-")
                    .addClass("btn").addClass("btn-danger")
                    .on("click", reduce_listener)
                )
                .append($("<input />")
                    .attr("type", "number").attr("min", "0").attr("step", "1")
                    .val(val).addClass("form-control")
                    .on("input", val_change_listener)
                )
                .append($("<button />")
                    .attr("type", "button").text("+")
                    .addClass("btn").addClass("btn-success")
                    .on("click", increase_listener)
                )
        );
    }

    build_player_stats() {
        this.player_stats_list.html('');
        for (const stat of this._app.adventure.player) {
            this.create_stat_row(
                this.player_stats_list, stat.key,
                this.reduce_player_stat.bind(this),
                stat.name, stat.val,
                this.change_player_stat.bind(this),
                this.increase_player_stat.bind(this)
            );
        }
    }

    reduce_player_stat(event) {
        const stat_row = $(event.delegateTarget).parent();
        const stat_key = parseInt(stat_row.data("stat_key"));
        const stat = this._app.adventure.get_player_stat(stat_key);
        if (stat.val > 0) {
            stat.val = stat.val - 1;
            stat_row.find("input").val(stat.val.toString());
        }
    }

    change_player_stat(event) {
        const target = $(event.delegateTarget)
        const stat_row = target.parent();
        const stat_key = parseInt(stat_row.data("stat_key"));
        const stat = this._app.adventure.get_player_stat(stat_key);

        const new_val = parseInt(target.val());
        stat.val = new_val;
    }

    increase_player_stat(event) {
        const stat_row = $(event.delegateTarget).parent();
        const stat_key = parseInt(stat_row.data("stat_key"));
        const stat = this._app.adventure.get_player_stat(stat_key);
        if (stat.val < Number.MAX_SAFE_INTEGER) {
            stat.val = stat.val + 1;
            stat_row.find("input").val(stat.val.toString());
        }
    }
}
