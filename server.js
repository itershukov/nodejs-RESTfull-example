/**
 * Created by itersh on 29.12.16.
 */

const cluster        = require('cluster')
    , path           = require('path')
    , express        = require('express')
    , cookieParser   = require('cookie-parser')
    , session        = require('cookie-session')
    , bodyParser     = require('body-parser')
    , serveStatic    = require('serve-static')
    , favicon        = require('serve-favicon')
    , logger         = require('morgan')
    , methodOverride = require('method-override')
    , multer         = require('multer')
    , busboy         = require('connect-busboy')
    , i18n           = require("i18n")
    , net            = require('net')
    , os             = require('os')

    , HRR            = require('./API/http/http-request-receiver')
    , WSS            = require('./API/ws/ws_request_receiver')
    , conf           = require('./utils/conf')
    , init           = require('./init/init')
    , l              = require('./logger/logger')
    , connectUtils   = require('./utils/connectUtils')

    , labels         = ["MAIN"]

conf.id = 0;
conf.pid = process.pid;

global.appRoot = path.resolve(__dirname);

if (cluster.isMaster) {

    for (let i = 0; i < os.cpus().length; i++) {
        l.info(labels, `Fork new process ${cluster.fork().id}`);
    }

    cluster.on('exit', (worker, code, signal) => {
        l.wrn(labels, `worker ${worker.process.pid} died`);

        conf.freePorts.push(conf.occupiedPorts[worker.process.pid]);
        let w = cluster.fork();
        l.info(labels, `Fork new process ${w.id}`);
    });

} else {
    conf.id = cluster.worker.id;

    let app = express();
    let expressWs = require('express-ws')(app);

    i18n.configure({
        locales:['en', 'ru'],
        directory: __dirname + '/locales'
    });
    app.use(i18n.init);
    app.disable('x-powered-by');
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(methodOverride());
    app.set('view engine', 'ejs');
    app.use("/public", serveStatic(path.join(__dirname, '/static/img')));
    app.use("/static", serveStatic(path.join(__dirname, '/static/')));
    app.use("/client", serveStatic(path.join(__dirname, '/client/')));
    app.use(cookieParser(conf.getSecret()));

    let options = {
        root: __dirname + '/client/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    app.set('trust proxy', 1)
    app.use(session(
        {
            name: conf.getSIDLabel(),
            keys: [conf.getSecret()],
            cookie: {
                expires:  new Date( Date.now() + conf.expireTime)
            }
        }
    ));

    app.use(busboy());

    HRR.createServer(app, options);
    WSS.createServer(app);
}

init.init();