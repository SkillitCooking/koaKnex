'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').users;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/users/authenticate', ctrl.authenticate);
router.post('/users', auth({authorization: AUTHORIZATION.CLIENT}), ctrl.post);
router.get('/users', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.get);
router.get('/users/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.getOne);
router.post('/users/balls', ctrl.balls);
router.post('/users/addAdmin', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.addAdmin);
router.put('/users/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.adminPut);
router.del('/users/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.del);

module.exports = router.routes();