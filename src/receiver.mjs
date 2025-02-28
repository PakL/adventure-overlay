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

    constructor() {
        this._adventure = Adventure.from(this, { player: [], enemies: [], enemy_template: [] });
        this.connect_to_peer();

        this.player_stats = $("#player");

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
        for (const update of this._adventure.compare(data)) {
            switch (update.action) {
                case "add": this.process_add(update); break;
                case "update": this.process_update(update); break;
            }
        }
    }

    /**
     * @param {import("./adventure.mjs").AdventureUpdate} update 
     */
    process_add(update) {
        switch (update.kind) {
            case "player":
                this.player_stats.append(
                    $("<div />").addClass("stat").attr("id", "player-stat-" + update.new_state.key).text(update.new_state.name)
                        .css("--background-color", update.new_state.color)
                        .css("--stat-bar-remain", (update.new_state.max <= 0 ? 100 : Math.round(100 / update.new_state.max * update.new_state.val).toString() + "%"))
                        .append($("<div />").addClass("shadow"))
                );
                break;
            case "enemy": break;
            case "item": break;
        }
    }

    /**
     * @param {import("./adventure.mjs").AdventureUpdate} update 
     */
    process_update(update) {
        switch (update.kind) {
            case "player":
                $("#player-stat-" + update.new_state.key)
                    .css("--background-color", update.new_state.color)
                    .css("--stat-bar-remain", (update.new_state.max <= 0 ? 100 : Math.round(100 / update.new_state.max * update.new_state.val).toString() + "%"))
                break;
            case "enemy": break;
            case "item": break;
        }
    }

    adventure_change() {
        // Do nothing for now
    }


}

window.receiver = new Receiver();