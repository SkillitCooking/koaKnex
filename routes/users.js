'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').users;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/users/authenticate', ctrl.authenticate);
router.post('/users', auth(AUTHORIZATION.CLIENT), ctrl.post);

module.exports = router.routes();