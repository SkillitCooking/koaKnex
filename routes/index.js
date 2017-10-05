'use strict';

const Router = require('koa-router');
const router = new Router();
const api = new Router();

const users = require('./users');
const ingredients = require('./ingredients');
const units = require('./units');
const tags = require('./tags');
const seasonings = require('./seasonings');
const recipes = require('./recipes');
const mealPlanEmailTypes = require('./mealPlanEmailTypes');
const mealPlans = require('./mealPlans');

api.use(users);
api.use(ingredients);
api.use(units);
api.use(tags);
api.use(seasonings);
api.use(recipes);
api.use(mealPlanEmailTypes);
api.use(mealPlans);

router.use('/api', api.routes());

module.exports = router;