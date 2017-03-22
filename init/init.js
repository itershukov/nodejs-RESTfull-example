/**
 * Created by itersh on 03.01.17.
 */

const cluster       = require('cluster')
    , numCPUs       = require('os').cpus().length

    //BASE
    , conf          = require('../utils/conf')
    , l             = require('../logger/logger')
    , masterChecker = require('../utils/master')
    , HRR           = require('../API/http/http_request_receiver')
    , WSS           = require('../API/ws/ws_request_receiver')
    , eb            = require('../eventbus/event_bus')

    //QOS
    , qos      = require('../qos/qos')

    //SYSTEM
    , system   = require('../system/version')
    , suicide  = require('../system/suicide')

    //LOGIC
    , Group    = require("../core/modules/group/init")

    //SECURITY
    , auth     = require('../security/auth_checker')

    //PAYMENT
    , pay      = require('../core/modules/payment/init')

    , labels = ["INIT"]


exports.init = ()=>{
    cluster.isMaster && tryInitAsMaster();

    function tryInitAsMaster(){
        conf.isDebugMode() && l.dbg(labels, "Try reinit as master")
        if (typeof(conf.isMainNode()) !== "boolean") {
            conf.isDebugMode() && l.dbg(labels, "Master not defined. Retry after timeout.")
            setTimeout(tryInitAsMaster, 1000);
            return;
        }
        if (cluster.isMaster && conf.isMainNode()){
            conf.isDebugMode() && l.dbg(labels, "Success reinit as master and start register master listeners")
            const manager = require('./init_manager');
            eb.initMasterListener();
            return;
        }
        setTimeout(tryInitAsMaster, 1000);
    }
}