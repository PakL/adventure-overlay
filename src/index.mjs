import { Peer } from "peerjs"
// import $ from "jquery"

import { Adventure } from "./adventure.mjs";
import { PlayPage } from "./play.mjs";
import { SetupPage } from "./setup.mjs";


let saving_timeout = null;
/**
 * @param {Adventure} adventure 
 */
function defer_saving(adventure) {
    if (saving_timeout !== null) {
        clearTimeout(saving_timeout);
    }
    saving_timeout = setTimeout(function () {
        saving_timeout = null;
        const stat_map_cb = (s) => { return { name: s._name, color: s._color, val: s._val, max: s._max }; };
        /** @type {import("./adventure.mjs").SerialAdventure} */
        const adventure_serial = {
            player: adventure.player.map(stat_map_cb),
            enemy_template: adventure.enemy_template.map(stat_map_cb),
            enemies: adventure.enemies.map((enemy) => enemy.map(stat_map_cb))
        };
        window.localStorage.setItem("adventure", JSON.stringify(adventure_serial));
    }, 200);
}


export class App {
    /** @type {PlayPage} */
    play;
    /** @type {SetupPage} */
    setup;

    /** @type {Adventure} */
    adventure;

    constructor() {
        this.load_adventure();
        this.play = new PlayPage(this);
        this.setup = new SetupPage(this);

        this.play.nav.on("click", this.open_play_page.bind(this));
        this.setup.nav.on("click", this.open_setup_page.bind(this));

        this.play.open();
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
        defer_saving(this.adventure);
    }

    /**
     * 
     * @param {import("peerjs").DataConnection} conn
     */
    new_connect(conn) {
        conn.on("data", (data) => {
            console.log(data);
        });
    }

}


window.app = new App();