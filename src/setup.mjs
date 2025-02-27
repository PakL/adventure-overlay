import $ from "jquery"

/**
 * @typedef {import("./index.mjs").App} App
 */

/**
 * @param {JQuery.ClickEvent|JQuery.ChangeEvent} event 
 * @returns {{ target: jQuery<HTMLInputElement|HTMLButtonElement>, stat_row: jQuery<HTMLDivElement>, stat_key: number }}
 */
export function get_stat_elements_from_event(event) {
    const target = $(event.delegateTarget);
    const stat_row = target.parent();
    const stat_key = parseInt(stat_row.data("stat_key"));
    return { target, stat_row, stat_key };
}

export class SetupPage {
    /** @type {App} */
    _app;
    /** @type {JQuery<HTMLDivElement>} */
    page;
    /** @type {JQuery<HTMLAnchorElement>} */
    nav;

    /** @type {JQuery<HTMLDivElement>} */
    play_attributes_list;
    /** @type {JQuery<HTMLButtonElement>} */
    player_add_attribute_btn;

    /** @type {JQuery<HTMLDivElement>} */
    enemy_attributes_list;
    /** @type {JQuery<HTMLButtonElement>} */
    enemy_add_attribute_btn;

    /**
     * @param {App} app 
     */
    constructor(app) {
        this._app = app;
        this.page = $("#page-setup");
        this.nav = $("#nav-setup");

        this.play_attributes_list = $("#setup-player-attributes");
        this.player_add_attribute_btn = $("#setup-player-attributes-add");
        this.enemy_attributes_list = $("#setup-enemy-attributes");
        this.enemy_add_attribute_btn = $("#setup-enemy-attributes-add");

        for (const stat of this._app.adventure.player) {
            this.create_player_stat_row(stat.key, stat.name, stat.color);
        }
        this.player_add_attribute_btn.on("click", this.add_player_stat.bind(this));

        for (const stat of this._app.adventure.enemy_template) {
            this.create_enemy_stat_row(stat.key, stat.name, stat.color);
        }
        this.enemy_add_attribute_btn.on("click", this.add_enemy_stat.bind(this));
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

    /**
     * @param {jQuery<HTMLDivElement>} list 
     * @param {string} key 
     * @param {string} name 
     * @param {function} name_change_listener 
     * @param {string} color 
     * @param {function} color_change_listener 
     * @param {function} remove_listener 
     */
    create_stat_row(list, key, name, name_change_listener, color, color_change_listener, remove_listener) {
        list.append(
            $("<div />").data("stat_key", key.toString())
                .addClass("input-group").addClass("mb-2")
                .append($("<input />")
                    .attr("type", "text").val(name)
                    .addClass("form-control").addClass("w-50")
                    .on("input", name_change_listener)
                )
                .append($("<input />")
                    .attr("type", "color").val(color)
                    .addClass("form-control").addClass("form-control-color")
                    .on("input", color_change_listener)
                )
                .append($("<button />")
                    .attr("type", "button").text("❌")
                    .addClass("btn").addClass("btn-outline-danger")
                    .on("click", remove_listener)
                )
        );
    }

    /**
     * @param {number} key
     * @param {string} name
     * @param {string} color
     */
    create_player_stat_row(key, name, color) {
        this.create_stat_row(
            this.play_attributes_list,
            key.toString(),
            name, this.player_stat_name_change.bind(this),
            color, this.player_stat_color_change.bind(this),
            this.remove_player_stat.bind(this)
        );
    }

    add_player_stat() {
        const stat = this._app.adventure.new_player_stat();
        this.create_player_stat_row(stat.key, stat.name, stat.color);
    }

    /**
     * @param {number} key
     * @param {string} name
     * @param {string} color
     */
    create_enemy_stat_row(key, name, color) {
        this.create_stat_row(
            this.enemy_attributes_list,
            key.toString(),
            name, this.enemy_stat_name_change.bind(this),
            color, this.enemy_stat_color_change.bind(this),
            this.remove_enemy_stat.bind(this)
        );
    }

    add_enemy_stat() {
        const stat = this._app.adventure.new_enemy_stat();
        this.create_enemy_stat_row(stat.key, stat.name, stat.color);
    }

    /**
     * @param {JQuery.ClickEvent} event 
     */
    remove_player_stat(event) {
        const { stat_row, stat_key } = get_stat_elements_from_event(event);
        stat_row.remove();
        this._app.adventure.remove_player_stat(stat_key);
    }

    /** @param {JQuery.Event} */
    player_stat_name_change(event) {
        const { target, stat_key } = get_stat_elements_from_event(event);
        this._app.adventure.get_player_stat(stat_key).name = target.val();
    }

    /** @param {JQuery.Event} */
    player_stat_color_change(event) {
        const { target, stat_key } = get_stat_elements_from_event(event);
        this._app.adventure.get_player_stat(stat_key).color = target.val();
    }



    /**
     * @param {JQuery.ClickEvent} event 
     */
    remove_enemy_stat(event) {
        const { stat_row, stat_key } = get_stat_elements_from_event(event);
        stat_row.remove();
        this._app.adventure.remove_enemy_stat(stat_key);
    }

    /** @param {JQuery.Event} */
    enemy_stat_name_change(event) {
        const { target, stat_key } = get_stat_elements_from_event(event);
        this._app.adventure.get_enemy_stat(stat_key).name = target.val();
    }

    /** @param {JQuery.Event} */
    enemy_stat_color_change(event) {
        const { target, stat_key } = get_stat_elements_from_event(event);
        this._app.adventure.get_enemy_stat(stat_key).color = target.val();
    }

}