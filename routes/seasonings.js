'use strict';

const Router = require('koa-router');
const router = new Router();

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

const ctrl = require('../controllers').seasonings;

router.post('/seasonings/getSeasonings', auth({authorization: AUTHORIZATION.PUBLIC}), ctrl.get);
router.post('/seasonings', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.post);
router.del('/seasonings/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.del);
router.put('/seasonings/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.put);

module.exports = router.routes();