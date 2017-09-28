'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').mealPlanEmailTypes;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/mealPlanEmailTypes/initialize', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.initialize);

module.exports = router.routes();