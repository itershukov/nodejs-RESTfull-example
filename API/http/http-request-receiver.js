/**
 * Created by itersh on 03.01.17.
 */

const conf         = require('../../utils/conf')
    , l            = require('../../logger/logger')
    , Const        = require('../../utils/const')
    , storage      = require('../../utils/storage')
    , userUtils    = require('../../core/modules/user/userUtils')
    , clientUtils  = require('../../utils/clientUtils')
    , httpAuth     = require('../../security/auth').httpAuth
    , connectUtils = require('../../utils/connectUtils')
    , labels       = ["HTTP", "REQUEST RECEIVER"]

let _resolve
    , init = new Promise(
                    (resolve, reject) => {
                        _resolve = resolve;
                    }
                )

const createServer = (app, options) =>{

    registerNewPostHandler(
        `${conf.prefix}/login`,
        false,
        httpAuth.login)

    ['options', 'post'].forEach(
        method => {

        }
    )

    conf.redirectToHome.forEach(
        url => registerNewHomePageHandler(`/${url}/:id?`)
    )

    app.get(`${conf.prefix}/logout`, httpAuth.logout);

    _resolve(app);
}

const registerNewOptionsHandler = (path, needAuth, onResult) => registerListener(path, needAuth, onResult, 'options')
    , registerNewGetHandler     = (path, needAuth, onResult) => registerListener(path, needAuth, onResult, 'get')
    , registerNewPutHandler     = (path, needAuth, onResult) => registerListener(path, needAuth, onResult, 'put')
    , registerNewPostHandler    = (path, needAuth, onResult) => registerListener(path, needAuth, onResult, 'post')
    , registerNewPatchHandler   = (path, needAuth, onResult) => registerListener(path, needAuth, onResult, 'patch')
    , registerNewDeleteHandler  = (path, needAuth, onResult) => registerListener(path, needAuth, onResult, 'delete')

exports.use = module =>
    init.then(
        app => {
            l.info(labels, `Register middleware`)
            app.use(module);
        },
        e => l.info(labels, `Error in process register middleware. Err: ${JSON.stringify(e)}`)
    )

exports.createServer = createServer;

exports.registerNewOptionsHandler = registerNewOptionsHandler
exports.registerNewGetHandler     = registerNewGetHandler
exports.registerNewPutHandler     = registerNewPutHandler
exports.registerNewPostHandler    = registerNewPostHandler
exports.registerNewPatchHandler   = registerNewPatchHandler
exports.registerNewDeleteHandler  = registerNewDeleteHandler

exports.registerNewHomePageHandler = registerNewHomePageHandler;

function registerNewHomePageHandler(path) {
    registerListener(path, true, (req, res)=>{

        let uid = req.session.user.id;

        Promise.all([
            clientUtils.getMenuInfo(uid, req.session.permission).then(info => connectUtils.setMenuInfo(res, info)),
            userUtils  .getUserById(uid, req.session.permission).then(user => connectUtils.setUserInfo(res, user)),

            storage    .getKeyByUserId(uid).then(key => connectUtils.setRemainingTime(res, key && key.endTime ? key.endTime : "0"))
        ]).then(
            r => res.sendFile(global.appRoot+'/client/home.html'),
            e => connectUtils.send500ToClient(req, res, e)
        )
    }, 'get');
}

function registerListener(path, needAuth, onResult, method){
    init.then(
        app => {
            l.info(labels, `Register new ${method} listener at path ${path} with${!needAuth ? 'out' : ''} auth`)
            app[method](path, needAuth ? httpAuth.check : onResult, needAuth ? onResult : null)
        },
        e => l.info(labels, `Error in process register new GET listener at path ${path} with${!needAuth ? 'out' : ''} auth. Err: ${JSON.stringify(e)}`)
    )
}