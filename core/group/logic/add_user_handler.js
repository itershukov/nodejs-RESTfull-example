/**
 * Created by itersh on 18.01.17.
 */
const eb      = require('../../../../eventbus/event_bus')
    , conf    = require('../../../../utils/conf')
    , storage = require('../../../../utils/storage')
    , cluster = require('cluster')
    , Const   = require('../../../../utils/const')
    , l       = require('../../../../logger/logger')
    , Group   = require('../data/group').default
    , grUtils = require('../groupUtils')
    , labels  = ["GROUP", "ADD USER HANDLER"]

eb.on((event, onResult)=>{

    if (!conf.isMainNode()) return;

    if (event.subtype !== Const.account.action.ADDED) return;

    const {title, permission, data} = event.data;

    const group = new Group({title: Const.account.type.USER, permission, data});

    groupUtils.addGroup(group)
        .then(
            r => onResult(null, r),
            e => onResult(e)
        )

}, Const.account.type.USER)