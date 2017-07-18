'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').ingredients;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/ingredients', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.post);
router.post('/ingredients/getIngredients', auth({authorization: AUTHORIZATION.PUBLIC}), ctrl.get);
router.put('/ingredients/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.put);
router.del('/ingredients/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.del);

module.exports = router.routes();