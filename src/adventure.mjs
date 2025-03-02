/**
 * @typedef {Object} BubbleOwner
 * @property {() => void} adventure_change
 */

/**
 * @typedef {Object} SerialAdventure
 * @property {SerialStat[]} player
 * @property {SerialStat[]} enemy_template
 * @property {SerialStat[][]} enemies
 * @property {string[]} items
 */
/**
 * @typedef {Object} SerialAdventureWKeys
 * @property {SerialStatWKey[]} player
 * @property {SerialStatWKey[]} enemy_template
 * @property {SerialStatWKey[][]} enemies
 * @property {string[]} items
 */

/**
 * @typedef {Object} SerialStat
 * @property {string} name
 * @property {string} color
 * @property {number} val
 * @property {number} max
 */

/**
 * @typedef {Object} SerialStatWKey
 * @property {number} key
 * @property {string} name
 * @property {string} color
 * @property {number} val
 * @property {number} max
 */

/**
 * @typedef {Object} AdventureUpdate
 * @property {"add"|"update"|"remove"} action
 * @property {"player"|"enemy"|"item"} kind
 * @property {number?} index
 * @property {string} key
 * @property {SerialStatWKey|SerialStatWKey[]} new_state
 */


/** @type {(s: Stat) => SerialStat} */
const stat_map_cb = (s) => { return { name: s._name, color: s._color, val: s._val, max: s._max }; };
/** @type {(s: Stat) => SerialStatWKey} */
const stat_map_w_keys_cb = (s) => { return { key: s._key, name: s._name, color: s._color, val: s._val, max: s._max }; };

export class Adventure {
    /**
     * @param {BubbleOwner} owner
     * @param {SerialAdventure|SerialAdventureWKeys} serial
     * @returns {Adventure}
     */
    static from(owner, serial) {
        let new_adventure = new Adventure({ adventure_change: () => { } });
        for (let i = 0; i < serial.player.length; i++) {
            const stat = new_adventure.new_player_stat();
            if (serial.player[i].key) {
                stat._key = serial.player[i].key;
            }
            stat._name = serial.player[i].name;
            stat._color = serial.player[i].color;
            stat._val = serial.player[i].val;
            stat._max = serial.player[i].max;
        }
        for (let i = 0; i < serial.enemy_template.length; i++) {
            const stat = new_adventure.new_enemy_stat();
            if (serial.enemy_template[i].key) {
                stat._key = serial.enemy_template[i].key;
            }
            stat._name = serial.enemy_template[i].name;
            stat._color = serial.enemy_template[i].color;
            stat._val = serial.enemy_template[i].val;
            stat._max = serial.enemy_template[i].max;
        }

        for (let j = 0; j < serial.enemies.length; j++) {
            const enemy = [];
            for (let i = 0; i < serial.enemies[j].length; i++) {
                const stat = new Stat(new_adventure);
                if (serial.enemies[j][i].key) {
                    stat._key = serial.enemies[j][i].key;
                }
                stat._name = serial.enemies[j][i].name;
                stat._color = serial.enemies[j][i].color;
                stat._val = serial.enemies[j][i].val;
                stat._max = serial.enemies[j][i].max;
                enemy.push(stat);
            }
            new_adventure.enemies.push(enemy);
        }

        if (serial.items) {
            new_adventure.items = serial.items;
        }

        new_adventure._owner = owner;
        return new_adventure;
    }

    /** @type {BubbleOwner} */
    _owner;
    /** @type {Stat[]} */
    player = [];
    /** @type {Stat[]} */
    enemy_template = [];
    /** @type {Stat[][]} */
    enemies = [];
    /** @type {string[]} */
    items = [];

    /**
     * @param {BubbleOwner} owner
     **/
    constructor(owner) {
        this._owner = owner;
    }

    /**
     * @param {Stat[]} ref
     * @returns {Stat}
     */
    _new_stat(ref) {
        const stat = new Stat(this);
        ref.push(stat);
        this._owner.adventure_change();
        return stat;
    }

    /**
     * @param {Stat[]} ref
     * @param {number} key
     * @returns {?Stat}
     **/
    _get_stat(ref, key) {
        for (let i = 0; i < ref.length; i++) {
            if (ref[i].key === key) {
                return ref[i];
            }
        }
        return null;
    }

    /**
     * @param {Stat[]} ref
     * @param {number} key
     **/
    _remove_stat(ref, key) {
        for (let i = 0; i < ref.length; i++) {
            if (ref[i].key === key) {
                ref.splice(i, 1);
                this._owner.adventure_change();
                return;
            }
        }
    }

    /** @returns {Stat} */
    new_player_stat() {
        return this._new_stat(this.player);
    }

    /**
     * @param {number} key
     * @returns {?Stat}
     **/
    get_player_stat(key) {
        return this._get_stat(this.player, key);
    }

    /**
     * @param {number} key 
     */
    remove_player_stat(key) {
        this._remove_stat(this.player, key);
    }

    /** @returns {Stat} */
    new_enemy_stat() {
        return this._new_stat(this.enemy_template);
    }

    /**
     * @param {number} key
     * @returns {?Stat}
     **/
    get_enemy_stat(key) {
        return this._get_stat(this.enemy_template, key);
    }

    /**
     * @param {number} key 
     */
    remove_enemy_stat(key) {
        this._remove_stat(this.enemy_template, key);
    }

    /**
     * @returns {Stat[]}
     */
    add_enemy() {
        const new_enemy = this.enemy_template.map((stat) => {
            const new_stat = new Stat(stat._owner);
            new_stat._name = stat._name;
            new_stat._color = stat._color;
            return new_stat;
        });
        this.enemies.push(new_enemy);
        this._owner.adventure_change();
        return new_enemy;
    }

    /**
     * @param {number} index
     */
    remove_enemy(index) {
        if (index < this.enemies.length) {
            this.enemies.splice(index, 1);
            this._owner.adventure_change();
        }
    }

    /**
     * @param {number} key
     * @returns {?Stat}
     **/
    find_stat_in_enemies(key) {
        for (let i = 0; i < this.enemies.length; i++) {
            const stat = this._get_stat(this.enemies[i], key);
            if (stat !== null) {
                return stat;
            }
        }
        return null;
    }

    adventure_change() {
        this._owner.adventure_change();
    }


    /**
     * 
     * @param {Stat[]} list_local 
     * @param {SerialStatWKey[]} list_new 
     * @param {"player"|"enemy"|"item"} kind 
     * @param {number?} index
     */
    compare_in_list(list_local, list_new, kind, index) {
        /** @type {AdventureUpdate[]} */
        const updates = [];

        const new_stat_keys = [];
        for (const stat of list_new) {
            new_stat_keys.push(stat.key);
            let local_stat = this._get_stat(list_local, stat.key)
            if (local_stat === null) {
                updates.push({ action: "add", kind, index, key: stat.key, new_state: stat });
                local_stat = this._new_stat(list_local);
            } else {
                if (
                    local_stat._name !== stat.name ||
                    local_stat._color !== stat.color ||
                    local_stat._val !== stat.val ||
                    local_stat._max !== stat.max
                ) {
                    updates.push({ action: "update", kind, index, key: stat.key, new_state: stat });
                }
            }

            local_stat._key = stat.key;
            local_stat._name = stat.name;
            local_stat._color = stat.color;
            local_stat._val = stat.val;
            local_stat._max = stat.max;
        }

        const remove_stat = [];
        for (const stat of list_local) {
            if (new_stat_keys.indexOf(stat.key) < 0) {
                updates.push({ action: "remove", kind, index, key: stat.key, new_state: null });
                remove_stat.push(stat.key);
            }
        }
        for (const key of remove_stat) {
            this._remove_stat(list_local, key);
        }
        return updates;
    }

    /**
     * @param {SerialAdventureWKeys} new_state 
     * @returns {AdventureUpdate[]}
     */
    compare(new_state) {
        /** @type {AdventureUpdate[]} */
        const updates = [];
        updates.push(...this.compare_in_list(this.player, new_state.player, "player"));


        for (let i = 0; i < new_state.enemies.length; i++) {
            if (this.enemies.length <= i) {
                this.enemies.push([]);
            }
            updates.push(...this.compare_in_list(this.enemies[i], new_state.enemies[i], "enemy", i));
        }
        if (this.enemies.length > new_state.enemies.length) {
            for (let i = new_state.enemies.length; i < this.enemies.length; i++) {
                updates.push({ action: "remove", kind: "enemy", index: i, key: -1, new_state: null });
            }
            this.enemies.splice(new_state.enemies.length, (this.enemies.length - new_state.enemies.length));
        }

        for (let i = 0; i < new_state.items.length; i++) {
            if (this.items.length <= i) {
                this.items.push(new_state.items[i]);
                updates.push({ action: "add", kind: "item", index: i, key: null, new_state: { val: new_state.items[i] } });
            } else {
                this.items[i] = new_state.items[i];
                updates.push({ action: "update", kind: "item", index: i, key: null, new_state: { val: new_state.items[i] } });
            }
        }
        if (this.items.length > new_state.items.length) {
            for (let i = new_state.items.length; i < this.items.length; i++) {
                updates.push({ action: "remove", kind: "item", index: i, key: null, new_state: null });
            }
            this.items.splice(new_state.items.length, (this.items.length - new_state.items.length));
        }

        return updates;
    }

    /** @returns {SerialAdventureWKeys} */
    to_jobject_w_keys() {
        return {
            player: this.player.map(stat_map_w_keys_cb),
            enemy_template: this.enemy_template.map(stat_map_w_keys_cb),
            enemies: this.enemies.map((enemy) => enemy.map(stat_map_w_keys_cb)),
            items: this.items.map((v) => v)
        };
    }

    /** @returns {SerialAdventure} */
    to_jobject() {
        return {
            player: this.player.map(stat_map_cb),
            enemy_template: this.enemy_template.map(stat_map_cb),
            enemies: this.enemies.map((enemy) => enemy.map(stat_map_cb)),
            items: this.items.map((v) => v)
        };
    }

    /** @returns {string} */
    to_json() {
        return JSON.stringify(this.to_jobject());
    }
}

let last_stat_key = 0;
function next_stat_key() {
    last_stat_key++;
    return last_stat_key;
}

export class Stat {
    /** @type {BubbleOwner} */
    _owner;

    _key = next_stat_key();
    _name = "";
    _color = "";
    _val = 0;
    _max = 0;

    /**
     * @param {owner} owner 
     */
    constructor(owner) {
        this._owner = owner;
    }

    get key() {
        return this._key;
    }

    get name() {
        return this._name;
    }
    set name(newname) {
        this._name = newname;
        this._owner.adventure_change();
    }

    get color() {
        return this._color;
    }
    set color(newcolor) {
        this._color = newcolor;
        this._owner.adventure_change();
    }

    get val() {
        return this._val;
    }
    set val(newval) {
        this._val = newval;
        if (this._val > this._max) {
            this._max = this._val;
        } else if (this._val === 0) {
            this._max = 0;
        }
        this._owner.adventure_change();
    }

    get max() {
        return this._max;
    }


}

