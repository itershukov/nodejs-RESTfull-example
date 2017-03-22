/**
 * Created by itersh on 18.01.17.
 */
const eb           = require("../../../eventbus/event_bus")
    , storage      = require("./../../../utils/storage")
    , utils        = require("./../../../utils/utils")
    , Group        = require("./data/group").default
    , l            = require("../../../logger/logger")
    , conf         = require("./../../../utils/conf")
    , Const        = require("./../../../utils/const")
    , EventDataExt = require("./../../../events/event_data_ext").default
    , SchJSON      = require("./schema/schema").getSchema()
    , labels       = ['UTILS', 'GROUP']

exports.addGroup = (src/*group*/) =>{
    conf.isDebugMode() && l.dbg(labels, `Try add group: ${JSON.stringify(src)}`)
    return new Promise((res, rej)=> {
        storage.putGroupIntoDB(src)
            .then(  r => getGroupById(r))
            .then(  r => validate(res, rej, r, `Success add group: ${JSON.stringify(r)}`, Const.account.action.ADDED))
            .catch( e => onFail(rej, `Can't get new group. Result: ${JSON.stringify(e)}`))
        })
}

exports.updateGroup = (src/*group*/) =>{
    let id = src.getId();
    conf.isDebugMode() && l.dbg(labels, `Try update group: ${JSON.stringify(src)}`)
    return new Promise((res, rej)=> {
        getGroupById(id)
            .then(
                r => {
                    if (!r || !src.hash || src.hash !== r.hash) {
                        onFail(rej, `Bad hash. Group already was changed ${id}`)
                    } else {

                        for (let key in src) {
                            if (r.hasOwnProperty(key)) {
                                r[key] = src[key];
                            }
                        }

                        delete r.hash;

                        const updatedGroup = new Group(r);

                        return storage.putGroupIntoDB(updatedGroup)
                    }
                }
            ).then(
                r => validate(res, rej, r, `Success UPDATE group with ID: ${id}`, Const.account.action.UPDATED)
            )
            .catch(
                e => onFail(rej, `Group not updated. Result: ${JSON.stringify(e)}`)
            )
        })
}

exports.deleteGroupById = (id) =>{
    conf.isDebugMode() && l.dbg(labels, `Try delete group by id: ${id}`)
    return new Promise((res, rej)=>{
        rej('Not supported yet');
    });
}

exports.getGroupById = getGroupById;

function getGroupById(id){
    conf.isDebugMode() && l.dbg(labels, `Try get group by id: ${id}`)
    return new Promise((res, rej)=>{
        storage.getGroupByID(id)
            .then( r => validate(res, rej, r, `Success get group by id: ${id}`))
            .catch(e => onFail(rej, `Group with ID: ${id} not found!`))
    })
}

exports.getAllGroups = () =>{
    conf.isDebugMode() && l.dbg(labels, `Try get all groups by from DB`)
    return new Promise((res, rej)=>{
        rej('Not supported yet');
    });
}

function validate(resolve, reject, result, msg, action){
    let cleared = utils.clearAndValidate(result, SchJSON.format.response)

    cleared.err ?
        onFail(reject, `Output validation failed ${cleared.err}`):
        onSuccess(resolve, cleared.result, msg, action)
}

function onSuccess(resolve, result, msg, action){
    msg && conf.isDebugMode() && l.dbg(labels, msg);
    resolve(result);
    action && eb.publishEvent(new EventDataExt({type: Const.account.type.GROUP, subtype: action, data: result}));
}

function onFail(reject, err){
    l.wrn(labels, err)
    reject(err);
}