'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').adminUtil;
const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/adminUtil/reseed', auth({authorization: AUTHORIZATION.PUBLIC}), ctrl.reseedDev);

module.exports = router.routes();