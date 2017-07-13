'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').ingredients;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/ingredients', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.post);

module.exports = router.routes();