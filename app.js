'use strict';

global.__base = __dirname + '/';

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
