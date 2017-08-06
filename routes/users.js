'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').users;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/users/authenticate', ctrl.authenticate);
router.post('/users', auth({authorization: AUTHORIZATION.CLIENT}), ctrl.post);
router.get('/users', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.get);
router.post('/users/balls', ctrl.balls);
router.post('/users/addAdmin', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.addAdmin);

module.exports = router.routes();