'use strict';

const Router = require('koa-router');
const router = new Router();
const api = new Router();

const users = require('./users');
const ingredients = require('./ingredients');
const units = require('./units');
const tags = require('./tags');

api.use(users);
api.use(ingredients);
api.use(units);
api.use(tags);

router.use('/api', api.routes());

module.exports = router;