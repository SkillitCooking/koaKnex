'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').tags;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.get('/tags', auth({authorization: AUTHORIZATION.PUBLIC}), ctrl.get);
router.post('/tags', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.post);

module.exports = router.routes();