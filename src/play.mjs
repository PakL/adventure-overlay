import $ from "jquery"

import { get_stat_elements_from_event } from "./setup.mjs";

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
    /** @type {JQuery<HTMLDivElement>} */
    enemies_list;
    /** @type {JQuery<HTMLDivElement>} */
    inventory_list;

    /** @type {JQuery<HTMLButtonElement>} */
    add_enemy_btn;
    /** @type {JQuery<HTMLButtonElement>} */
    add_item_btn;


    /**
     * @param {App} app 
     */
    constructor(app) {
        this._app = app;
        this.page = $("#page-play");
        this.nav = $("#nav-play");

        this.player_stats_list = $('#play-player-attributes');
        this.enemies_list = $("#enemies");
        this.inventory_list = $("#play-inventory");
        this.add_enemy_btn = $("#play-enemy-add");
        this.add_item_btn = $("#play-item-add");

        this.add_enemy_btn.on("click", this.add_enemy.bind(this));
        this.add_item_btn.on("click", this.add_item.bind(this));
    }

    open() {
        this.page
            .removeClass("d-none")
            .addClass("d-block");
        this.nav.addClass("active");

        this.build_player_stats();
        this.build_enemy_stats();

        this.inventory_list.html('');
        for (const item of this._app.adventure.items) {
            this.add_item(item);
        }
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

    /**
     * @param {JQuery.ClickEvent} event 
     */
    reduce_player_stat(event) {
        const { stat_row, stat_key } = get_stat_elements_from_event(event);
        const stat = this._app.adventure.get_player_stat(stat_key);
        if (stat !== null && stat.val > 0) {
            stat.val = stat.val - 1;
            stat_row.find("input").val(stat.val.toString());
        }
    }

    /**
     * @param {JQuery.ChangeEvent} event 
     */
    change_player_stat(event) {
        const { target, stat_key } = get_stat_elements_from_event(event);
        const stat = this._app.adventure.get_player_stat(stat_key);
        if (stat !== null) {
            const new_val = parseInt(target.val());
            stat.val = new_val;
        }
    }

    /**
     * @param {JQuery.ClickEvent} event 
     */
    increase_player_stat(event) {
        const { stat_row, stat_key } = get_stat_elements_from_event(event);
        const stat = this._app.adventure.get_player_stat(stat_key);
        if (stat !== null && stat.val < Number.MAX_SAFE_INTEGER) {
            stat.val = stat.val + 1;
            stat_row.find("input").val(stat.val.toString());
        }
    }

    /**
     * 
     * @param {Stat[]} [new_enemy]
     */
    add_enemy(new_enemy) {
        if (typeof (new_enemy) === "undefined" || !Array.isArray(new_enemy)) {
            new_enemy = this._app.adventure.add_enemy();
        }
        const enemy_card_body = $("<div />").addClass("card-body");

        for (const stat of new_enemy) {
            this.create_stat_row(
                enemy_card_body, stat.key,
                this.reduce_enemy_stat.bind(this),
                stat.name, stat.val,
                this.change_enemy_stat.bind(this),
                this.increase_enemy_stat.bind(this)
            );
        }

        enemy_card_body.append($("<div />")
            .addClass("d-grid")
            .append($("<button />")
                .attr("type", "button").text("Remove enemy")
                .addClass("btn").addClass("btn-outline-danger")
                .on("click", this.remove_enemy.bind(this))))

        const enemy_card = $("<div />")
            .addClass("card").addClass("mt-2")
            .addClass("shadow").append(enemy_card_body);
        this.enemies_list.append(enemy_card);
    }


    build_enemy_stats() {
        this.enemies_list.html('');
        for (const enemy of this._app.adventure.enemies) {
            this.add_enemy(enemy);
        }
    }

    /**
     * @param {JQuery.ClickEvent} event 
     */
    remove_enemy(event) {
        const target = $(event.delegateTarget);
        const card = target.parents(".card.shadow");
        const index = this.enemies_list.find(".card").index(card);
        console.log(card, index)
        if (index >= 0) {
            this._app.adventure.remove_enemy(index);
            card.remove();
        }
    }

    /**
     * @param {JQuery.ClickEvent} event 
     */
    reduce_enemy_stat(event) {
        const { stat_row, stat_key } = get_stat_elements_from_event(event);
        const stat = this._app.adventure.find_stat_in_enemies(stat_key);
        if (stat !== null && stat.val > 0) {
            stat.val = stat.val - 1;
            stat_row.find("input").val(stat.val.toString());
        }
    }

    /**
     * @param {JQuery.ChangeEvent} event 
     */
    change_enemy_stat(event) {
        const { target, stat_key } = get_stat_elements_from_event(event);
        const stat = this._app.adventure.find_stat_in_enemies(stat_key);
        if (stat !== null) {
            const new_val = parseInt(target.val());
            stat.val = new_val;
        }
    }

    /**
     * @param {JQuery.ClickEvent} event 
     */
    increase_enemy_stat(event) {
        const { stat_row, stat_key } = get_stat_elements_from_event(event);
        const stat = this._app.adventure.find_stat_in_enemies(stat_key);
        if (stat !== null && stat.val < Number.MAX_SAFE_INTEGER) {
            stat.val = stat.val + 1;
            stat_row.find("input").val(stat.val.toString());
        }
    }

    /**
     * @param {string} val 
     */
    add_item(val) {
        if (typeof (val) !== "string") {
            val = "";
            this._app.adventure.items.push("");
            this._app.adventure.adventure_change();
        }

        this.inventory_list.append(
            $("<div />").addClass("input-group").addClass("mb-2")
                .append($("<input />")
                    .attr("type", "text").val(val)
                    .addClass("form-control")
                    .on("input", this.item_name_change.bind(this))
                )
                .append($("<button />")
                    .attr("type", "button").text("❌")
                    .addClass("btn").addClass("btn-outline-danger")
                    .on("click", this.item_remove.bind(this))
                )
        )
    }

    /**
     * @param {JQuery<HTMLDivElement>} target
     */
    get_item_index(target) {
        return this.inventory_list.find(".input-group").index(target);
    }

    /**
     * @param {JQuery.ChangeEvent} event 
     */
    item_name_change(event) {
        const target = $(event.delegateTarget);
        const index = this.get_item_index(target.parent());
        this._app.adventure.items[index] = target.val();
        this._app.adventure.adventure_change();
    }

    /**
     * @param {JQuery.ClickEvent} event 
     */
    item_remove(event) {
        const target = $(event.delegateTarget).parent();
        const index = this.get_item_index(target);
        this._app.adventure.items.splice(index, 1);
        this._app.adventure.adventure_change();
        target.remove();
    }
}
