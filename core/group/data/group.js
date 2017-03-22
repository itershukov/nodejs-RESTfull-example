/**
 * Created by itersh on 18.01.17.
 */

const conf    = require("../../../../utils/conf")
    , Const   = require("../../../../utils/const")
    , Account = require('./../../../../account/account')
    , assert  = require("assert")
    , crypto  = require('crypto')
    , type    = Const.account.type.GROUP

class Group extends Account.default{

    constructor({id, title, permission, data, avatar = "default", hash = null, active = true, createTS = conf.getCurrentTs(), changeTS = conf.getCurrentTs()}) {
        id && assert(typeof id   === "number");

        assert(typeof title      === "string");
        assert(typeof permission === "object");
        assert(typeof avatar     === "string");

        data  && assert(typeof data  === "object");
        title && assert(typeof title === "string");

        super(type, data);

        let HASH        = crypto.createHash('md5')

        this.hash       = hash || HASH.update(JSON.stringify(this)).digest('hex')

        this.id         = id || null;
        this.type       = type;
        this.createTS   = createTS;
        this.changeTS   = changeTS;
        this.title      = title;
        this.avatar     = avatar;
        this.permission = permission;
        this.data       = data;
        this.active     = active;
    }

    getId(){
        return this.id;
    }

    getTitle(){
        return this.title;
    }

    static getFullID(){
        return `${this.id}_${this.type}`;
    }
}

exports.default = Group;