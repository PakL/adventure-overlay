/**
 * @typedef {Object} BubbleOwner
 * @property {() => void} adventure_change
 */

/**
 * @typedef {Object} SerialAdventure
 * @property {SerialStat[]} player
 * @property {SerialStat[]} enemy_template
 */

/**
 * @typedef {Object} SerialStat
 * @property {string} name
 * @property {string} color
 * @property {number} val
 * @property {number} max
 */

export class Adventure {
    /**
     * @param {BubbleOwner} owner
     * @param {SerialAdventure} serial
     * @returns {Adventure}
     */
    static from(owner, serial) {
        let new_adventure = new Adventure({ adventure_change: () => { } });
        for (let i = 0; i < serial.player.length; i++) {
            const stat = new_adventure.new_player_stat();
            stat._name = serial.player[i].name;
            stat._color = serial.player[i].color;
            stat._val = serial.player[i].val;
            stat._max = serial.player[i].max;
        }
        for (let i = 0; i < serial.enemy_template.length; i++) {
            const stat = new_adventure.new_enemy_stat();
            stat._name = serial.enemy_template[i].name;
            stat._color = serial.enemy_template[i].color;
            stat._val = serial.enemy_template[i].val;
            stat._max = serial.enemy_template[i].max;
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
        const new_enemy = structuredClone(this.enemy_template);
        new_enemy.forEach((stat) => {
            stat._key = next_stat_key();
        });
        this.enemies.push(new_enemy);
        return new_enemy;
    }

    adventure_change() {
        this._owner.adventure_change();
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
        }
        this._owner.adventure_change();
    }

    get max() {
        return this._max;
    }


}

