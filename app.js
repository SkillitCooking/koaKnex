'use strict';
//nice for really nested modules...
//global.__base = __dirname + '/';

const config = require('./config');
const http = require('http');
const Koa = require('koa');

const app = new Koa();

//for signed cookies
app.keys = [config.secret];

require('./schemas')(app);
const responseTime = require('./middleware/response-time-middleware');
const rateLimit = require('./middleware/ratelimit-middleware');
const helmet = require('koa-helmet');
const logger = require('./middleware/logger-middleware');
const camelizeMiddleware = require('./middleware/camelize-middleware');
const error = require('./middleware/error-middleware');
const db = require('./middleware/db-middleware');
const cors = require('kcors');
const jwt = require('./middleware/jwt-middleware');
const bodyParser = require('koa-bodyparser');
const userMiddleware = require('./middleware/user-middleware');
const routes = require('./routes');

if(!config.env.isTest) {
    app.use(responseTime());
    app.use(helmet());
}

/**
 * ANNOTATE what each of the below are all for
 */
app.use(logger({app: app}));
app.use(error());
app.use(rateLimit);
app.use(camelizeMiddleware);
app.use(db(app));
app.use(cors(config.cors));
app.use(jwt);
app.use(bodyParser(config.bodyParser));
app.use(userMiddleware);
app.use(routes.routes());
app.use(routes.allowedMethods());

//for shutting down gracefully
app.server = require('http-shutdown')(http.createServer(app.callback()));

app.shutDown = function shutDown() {
    let err;
    console.log('SHUTDOWN');
    if(this.server.listening) {
        this.server.shutdown(error => {
            if(error) {
                console.error(error);
                err = error;
            }
            this.db.destroy()
                .catch(error => {
                    console.error(error);
                    err = error;
                })
                .then(() => process.exit(err ? 1 : 0));
        });
    }
};

module.exports = app;