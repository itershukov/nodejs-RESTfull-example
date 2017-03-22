/**
 * Created by itersh on 18.01.17.
 */
const router               = require("../../../../API/http/http_request_receiver")
    , connectUtils         = require("../../../../utils/connectUtils")
    , l                    = require("../../../../logger/logger")
    , utils                = require("../../../../utils/utils")
    , groupUtils           = require("../groupUtils")
    , SchemaJSON           = require("../schema/schema").getSchema()
    , storage              = require("../../../../utils/storage")
    , Const                = require("../../../../utils/const")
    , conf                 = require("../../../../utils/conf")
    , Group                = require("../data/group").default
    , pathGroup            = connectUtils.getPathAPI('/group(/){0,1}')
    , pathGroupByID        = connectUtils.getPathAPI(`/group/(${Const.regExp.titleString().pattern.slice(1, -1)})(/){0,1}`)
    , labels               = ["HTTP", "GROUP HANDLER"]
    , aliases              = [pathGroup.toString(), pathGroupByID.toString()]

init = ()=>{
    router.registerNewOptionsHandler(pathGroup, true, getOptions)
    router.registerNewPostHandler   (pathGroup, true, addGroup)
    router.registerNewGetHandler    (pathGroup, true, getAllGroups)
    router.registerNewDeleteHandler (pathGroup, true, deleteAllGroup)
    router.registerNewPutHandler    (pathGroupByID, true, updateGroup)
    router.registerNewOptionsHandler(pathGroupByID, true, getOptions)
    router.registerNewGetHandler    (pathGroupByID, true, getGroup)
    router.registerNewDeleteHandler (pathGroupByID, true, deleteGroup)
}

init();

function addGroup(req, res){
    let request = req.body
        , group = null

    try {
        l.info(labels, `Try add group`);

        group = new Group(request);

        groupUtils.addGroup(group)
            .then(
                r => connectUtils.send200ToClient(req, res, r),
                e => connectUtils.send400ToClient(req, res, e)
            )
    } catch (err) {
        connectUtils.send400ToClient(req, res, err.stack);
    }
}

function updateGroup(req, res){
    let groupId   = req.params[0]
        , request = req.body
        , group   = null

    try {
        l.info(labels, `Try update group by ID: ${groupId}`);

        group = new Group(request);

        groupUtils.updateGroup(group)
            .then(
                r => connectUtils.send200ToClient(req, res, r),
                e => connectUtils.send400ToClient(req, res, e)
            )
    } catch (err) {
        connectUtils.send400ToClient(req, res, err.stack);
    }
}

function deleteGroup(req, res){
    let groupId = req.params[0];

    l.info(labels, `Try delete group by ID: ${groupId}`);

    groupUtils.deleteGroupById(groupId)
        .then(
            r => connectUtils.send200ToClient(req, res, r),
            e => connectUtils.send400ToClient(req, res, e)
        )
}

function getGroup(req, res){
    let groupId = req.params[0];

    l.info(labels, `Try get group by ID: ${groupId}`);

    groupUtils.getGroupById(groupId)
        .then(
            r => connectUtils.send200ToClient(req, res, r),
            e => connectUtils.send400ToClient(req, res, e)
        )
}

function getAllGroups(req, res){
    l.info(labels, `Try get list of groups`);

    groupUtils.getAllGroups()
        .then(
            r => connectUtils.send200ToClient(req, res, r),
            e => connectUtils.send400ToClient(req, res, e)
        )
}

function deleteAllGroup(req, res){
    l.wrn(labels, `Try delete all groups`);
    connectUtils.send404ToClient(req, res, `You can't delete all groups. Please specify group ID.`);
}

function getOptions(req, res){
    SchemaJSON.aliases = aliases;

    connectUtils.send200ToClient(req, res, `${JSON.stringify(SchemaJSON)}`);
}

