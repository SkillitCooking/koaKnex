'use strict';

const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers').mealPlans;

const auth = require('../middleware/auth-required-middleware');
const {AUTHORIZATION} = require('../lib/constants');

router.post('/mealPlans', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.post);
router.get('/mealPlans/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.getOne);
router.get('/mealPlans/byUser/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.mealPlansForUser);
router.put('/mealPlans/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.put);
router.del('/mealPlans/:id', auth({authorization: AUTHORIZATION.PRIVATE}), ctrl.del);

module.exports = router.routes();