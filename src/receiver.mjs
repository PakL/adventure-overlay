import { Peer } from "peerjs"
import $ from "jquery"

import { Adventure } from "./adventure.mjs";

class Receiver {
    /** @type {Adventure} */
    _adventure;
    /** @type {Peer} */
    peer;
    /** @type {import("peerjs").DataConnection} */
    connection = null;

    /** @type {JQuery<HTMLDivElement>} */
    player_stats;
    /** @type {JQuery<HTMLDivElement>} */
    enemies_stats;
    /** @type {JQuery<HTMLDivElement>} */
    items_list;

    constructor() {
        this._adventure = Adventure.from(this, { player: [], enemies: [], enemy_template: [] });
        this.connect_to_peer();

        this.player_stats = $("#player");
        this.enemies_stats = $("#enemies");
        this.items_list = $("#items");

        window.addEventListener("beforeunload", this.on_before_unload.bind(this));
    }

    on_before_unload() {
        if (this.connection !== null) {
            this.connection.close();
        }
    }

    connect_to_peer() {
        this.peer = new Peer({ host: "localhost", port: 9000 });
        this.peer.on("open", this.on_peer_open.bind(this));
        this.peer.on("error", this.on_peer_error.bind(this));
        this.peer.on("close", this.on_peer_close.bind(this));
    }

    on_peer_open() {
        this.connection = this.peer.connect("pakl-dev-cbf1af10-08f1-4889-9fbb-dcacd175a2e0");
        this.connection.on("open", this.on_peer_connection.bind(this));
        this.connection.on("close", this.on_peer_connection_close.bind(this));
        this.connection.on("data", this.on_peer_data.bind(this));
    }

    on_peer_error() {
        this.peer.removeAllListeners();
        setTimeout(this.connect_to_peer.bind(this), 3000);
    }

    on_peer_close() {
        this.peer.removeAllListeners();
        connect_to_peer();
    }

    on_peer_connection() {
        console.log("connection open");
        this.connection.send("Hello server!");
    }

    on_peer_connection_close() {
        this.on_peer_open();
    }

    /**
     * @param {string} data 
     */
    on_peer_data(data) {
        const changes = this._adventure.compare(data);
        for (const update of changes) {
            switch (update.action) {
                case "add": this.process_add(update); break;
                case "update": this.process_update(update); break;
                case "remove": this.process_remove(update); break;
            }
        }
    }

    /**
     * @param {JQuery<HTMLDivElement>} container 
     * @param {import("./adventure.mjs").SerialStatWKey} stat 
     */
    add_stat(container, stat) {
        container.append(
            $("<div />").addClass("stat").attr("data-key", stat.key)
                .css("--background-color", stat.color)
                .css("--stat-bar-remain", (stat.max <= 0 ? 100 : Math.round(100 / stat.max * stat.val).toString() + "%"))
                .append($("<span />").addClass("name").text(stat.name))
                .append($("<span />").addClass("val").text(stat.val))
                .append($("<div />").addClass("shadow"))
        );
    }

    /**
     * @param {JQuery<HTMLDivElement>} container 
     * @param {number} key 
     * @param {import("./adventure.mjs").SerialStatWKey} new_state 
     */
    update_stat(container, key, new_state) {
        const stat = container.find(".stat[data-key=" + key + "]");
        stat.find(".name").text(new_state.name)
        stat.find(".val").text(new_state.val)
        stat.css("--background-color", new_state.color)
            .css("--stat-bar-remain", (new_state.max <= 0 ? 100 : Math.round(100 / new_state.max * new_state.val).toString() + "%"))
    }

    /**
     * @param {number} index 
     * @returns {JQuery<HTMLDivElement>}
     */
    get_enemy_container(index) {
        const enemy_containers = this.enemies_stats.find(".enemy");
        let enemy;
        if (enemy_containers.length > index) {
            enemy = $(enemy_containers.get(index));
        } else {
            enemy = $("<div />").addClass("enemy");
            this.enemies_stats.append(enemy);
        }
        return enemy;
    }

    /**
     * @param {import("./adventure.mjs").AdventureUpdate} update 
     */
    process_add(update) {
        switch (update.kind) {
            case "player":
                this.add_stat(this.player_stats, update.new_state);
                break;
            case "enemy":
                this.add_stat(this.get_enemy_container(update.index), update.new_state);
                break;
            case "item":
                this.items_list.append($("<div />").text(update.new_state.val));
                break;
        }
    }

    /**
     * @param {import("./adventure.mjs").AdventureUpdate} update 
     */
    process_update(update) {
        switch (update.kind) {
            case "player":
                this.update_stat(this.player_stats, update.key, update.new_state);
                break;
            case "enemy":
                this.update_stat(this.get_enemy_container(update.index), update.key, update.new_state);
                break;
            case "item":
                this.items_list.find("div:nth-child(" + (update.index + 1) + ")").text(update.new_state.val);
                break;
        }
    }

    /**
     * @param {import("./adventure.mjs").AdventureUpdate} update 
     */
    process_remove(update) {
        switch (update.kind) {
            case "player":
                this.player_stats.find(".stat[data-key=" + update.key + "]").remove();
                break;
            case "enemy":
                const enemy_container = this.get_enemy_container(update.index);
                if (update.key < 0) {
                    enemy_container.remove();
                } else {
                    enemy_container.find(".stat[data-key=" + update.key + "]").remove();
                }
                break;
            case "item":
                this.items_list.find("div:nth-child(" + (update.index + 1) + ")").remove();
                break;
        }
    }

    adventure_change() {
        // Do nothing for now
    }


}

window.receiver = new Receiver();