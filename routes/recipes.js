'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').recipes;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/recipes/getRecipes', auth({authorization: AUTHORIZATION.PUBLIC}), ctrl.get);
router.post('/recipes', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.post);
router.del('/recipes/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.del);
router.put('/recipes/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.put);

module.exports = router.routes()