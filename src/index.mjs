import { Peer } from "peerjs"
import $ from "jquery"

import { Adventure } from "./adventure.mjs";
import { PlayPage } from "./play.mjs";
import { SetupPage } from "./setup.mjs";

let peer_options = {};
if (document.location.hostname === "localhost" || document.location.hostname.startsWith("127.0.0.")) {
    peer_options = { host: "localhost", port: 9000 };
}

let saving_timeout = null;
/**
 * @param {Adventure} adventure 
 */
function defer_saving(adventure, broadcast_cb) {
    if (saving_timeout !== null) {
        clearTimeout(saving_timeout);
    }
    saving_timeout = setTimeout(function () {
        saving_timeout = null;
        const adventure_json = adventure.to_json();
        window.localStorage.setItem("adventure", adventure_json);
        broadcast_cb();
    }, 200);
}


export class App {
    /** @type {PlayPage} */
    play;
    /** @type {SetupPage} */
    setup;

    /** @type {Adventure} */
    adventure;

    /** @type {JQuery<HTMLDivElement>} */
    connection_status;

    /** @type {Map<string, import("peerjs").DataConnection>} */
    connection_map;

    /** @type {Peer} */
    peer;

    constructor() {
        this.connection_status = $("#connection_status");

        this.load_adventure();
        this.play = new PlayPage(this);
        this.setup = new SetupPage(this);

        this.play.nav.on("click", this.open_play_page.bind(this));
        this.setup.nav.on("click", this.open_setup_page.bind(this));

        this.play.open();


        this.connection_map = new Map();
        this.connect_to_peer();
    }

    load_adventure() {
        const serial_data = JSON.parse(window.localStorage.getItem("adventure") ?? "null");
        if (serial_data === null) {
            this.adventure = new Adventure(this);
        } else {
            this.adventure = Adventure.from(this, serial_data);
        }
    }

    open_play_page() {
        this.setup.close();
        this.play.open();
    }

    open_setup_page() {
        this.play.close();
        this.setup.open();
    }

    adventure_change() {
        defer_saving(this.adventure, this.broadcast_to_peers.bind(this));
    }

    connect_to_peer() {
        let connection_uuid = localStorage.getItem("connection_uuid");
        if (connection_uuid === null) {
            connection_uuid = crypto.randomUUID();
            localStorage.setItem("connection_uuid", connection_uuid);
        }

        this.peer = new Peer("pakl-dev-" + connection_uuid, peer_options);
        this.peer.on("open", this.on_peer_open.bind(this));
        this.peer.on("error", this.on_peer_error.bind(this));
        this.peer.on("connection", this.on_new_peer_connection.bind(this));
    }

    broadcast_to_peers() {
        const adventure_object = this.adventure.to_jobject_w_keys();
        this.connection_map.forEach((conn) => {
            conn.send(adventure_object);
        });
    }

    /**
     * @param {string} id 
     */
    on_peer_open(id) {
        let connection_uuid = localStorage.getItem("connection_uuid");
        if (id === "pakl-dev-" + connection_uuid) {
            const num = connection_uuid.replace(/-/g, "").match(/.{1,2}/g).map((byte) => parseInt(byte, 16));
            const urlcode = btoa(String.fromCharCode.apply(null, num));
            $("#receiver_url").html("Copy this URL as a browser source in OBS: <code>" + document.location.protocol + "//" + document.location.host + document.location.pathname.replace(/\/index.html$/i, "/") + "receiver.html?" + encodeURIComponent(urlcode) + "</code>");
            this.connection_status.text("Connection open. Waiting for clients");
        } else {
            this.connection_status.text("Invalid connection. Reload page to try again.");
            localStorage.removeItem("connection_uuid");
        }
    }

    on_peer_error() {
        this.peer.removeAllListeners();
        setTimeout(this.connect_to_peer.bind(this), 3000);
    }

    /**
     * @param {import("peerjs").DataConnection} conn
     */
    on_new_peer_connection(conn) {
        conn.on("data", (data) => {
            if (data === "Hello server!") {
                console.log("New connection");
                this.connection_map.set(conn.connectionId, conn);
                this.connection_status.text(this.connection_map.size + " clients connected");
                conn.send(this.adventure.to_jobject_w_keys());
            }
        });
        conn.on("close", (() => {
            this.connection_map.delete(conn.connectionId);
            console.log("Connection lost");
            this.connection_status.text(this.connection_map.size + " clients connected");
        }).bind(this));
    }

}


window.app = new App();