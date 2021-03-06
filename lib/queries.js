'use strict';

const {makeSchemaArray, isUUIDArray} = require('./validation');
const errors = require('../lib/errors');
const {PREFIX} = require('./constants');
const humps = require('humps');
const isUUID = require('validator/lib/isUUID');

const ingredientsFetchFields = {
    ingredients: ['id', 'name_singular', 'name_plural', 'store_keeping_name', 'description', 'is_composite', 'serving_size', 'est_total_price', 'total_size'],
    tags: ['id', 'name'],
    ingredientTags: ['id', 'type'],
    units: ['id', 'name_singular', 'name_plural', 'abbreviation'],
    composingIngredients: ['id', 'is_optional'],
    childIngredients: ['id', 'name_singular', 'name_plural']
};

const seasoningsFetchFields = {
    seasonings: ['id', 'name', 'is_composite'],
    composingSeasonings: ['id'],
    childSeasonings: ['id', 'name']
};

const userAdminFetchFields = {
    users: ['id', 'username', 'email', 'first_name', 'last_name', 'address_street',
        'address_street2', 'address_city', 'address_state', 'address_zip', 'age', 
        'gender', 'is_due_for_meal_plan', 'is_admin', 'password'],
    deliveryPreferences: ['id', 'user', 'meals_per_week', 'min_deliveries_per_week', 
        'max_deliveries_per_week', 'servings_per_meal']
};

const recipesFetchFields = {
    recipes: ['id', 'title', 'description', 'main_image_url', 'main_link_url', 'active_time', 'total_time'],
    steps: ['id', 'text', 'order', 'main_link_url'],
    tags: ['id', 'name'],
    stepTags: ['id'],
    ingredients: ['id', 'name_singular', 'name_plural', 'store_keeping_name', 'description', 'serving_size', 'is_composite', 'est_total_price', 'total_size'],
    units: ['id', 'name_singular', 'name_plural', 'abbreviation'],
    ingredientTags: ['id'],
    recipeIngredients: ['id', 'is_frozen', 'proportion'],
    seasonings: ['id', 'name', 'is_composite'],
    recipeSeasonings: ['id', 'present_order'],
    recipeTags: ['id']
};

const mealPlanFetchFields = {
    mealPlans: ['id', 'user', 'delivery_time', 'title', 'overview', 'delivery_timezone'],
    recipeMealPlans: ['id', 'order'],
    ingredientsForMealPlan: ['id'],
    ingredientMealPlans: ['id'],
    recipes: ['id', 'title', 'description', 'main_image_url', 'main_link_url', 'active_time', 'total_time'],
    steps: ['id', 'text', 'order', 'main_link_url'],
    tags: ['id', 'name'],
    stepTags: ['id'],
    ingredients: ['id', 'name_singular', 'name_plural', 'store_keeping_name', 'description', 'serving_size', 'is_composite', 'est_total_price', 'total_size'],
    units: ['id', 'name_singular', 'name_plural', 'abbreviation'],
    ingredientTags: ['id'],
    recipeIngredients: ['id', 'is_frozen', 'proportion'],
    seasonings: ['id', 'name', 'is_composite'],
    recipeSeasonings: ['id', 'present_order'],
    recipeTags: ['id']
};

function getSelectQueries(table, prefix, fields) {
    return fields.map((field) => {
        return table + '.' + field + ' as ' + prefix + '_' + field;
    });
}

async function handleRemoveIdArrs(arr, ctx, dbName, db) {
    db = db ? db : ctx.app.db;
    if(arr.length > 0) {
        let isValid = await isUUIDArray(arr);
        if(!isValid) {
            ctx.throw(422, new errors.ValidationError(dbName + 'ToRemove not UUID array'));
        }
        return db(dbName).whereIn('id', arr).del();
    }
    return false;
}

//can make below more efficient? https://stackoverflow.com/questions/40543668/batch-update-in-knex
//https://stackoverflow.com/questions/18797608/update-multiple-rows-in-same-query-using-postgresql
async function getUpdateQueries(schema, tableName, objArr, idProp, knex) {
    let arrSchema = makeSchemaArray(schema);
    let validationOpts = {
        abortEarly: false,
        context: {isUpdate: true}
    };
    //decamelize?
    objArr = await arrSchema.validate(objArr, validationOpts);
    objArr = humps.decamelizeKeys(objArr);
    let updateQuery = ['UPDATE ' + tableName + ' SET ',
        Object.keys(objArr[0]).map((key) => key + ' = c.' + key).join(','),
        ' FROM (VALUES ',
        objArr.map((obj) => {
            let arr = [];
            Object.keys(obj).forEach((key) => {
                //if isUUID, wrap in braces
                if(typeof obj[key] === 'string' && isUUID(obj[key])) arr.push('uuid(\'' + obj[key] + '\')');
                else if(typeof obj[key] === 'string') arr.push('\'' + obj[key] + '\'');
                else arr.push(obj[key]);
            });
            return '(' + arr.join(',') + ')';
        }).join(','),
        ') AS c(',
        Object.keys(objArr[0]).join(','),
        ') WHERE c.' + idProp + ' = ' + tableName +  '.' + idProp  
    ].join('');
    return knex.raw(updateQuery);
}

function getRecipeJoinQuery(db) {
    return  db
        .leftJoin('steps', 'recipes.id', 'steps.recipe')
        .leftJoin('step_tags', 'steps.id', 'step_tags.step')
        .leftJoin('recipe_ingredients', 'recipes.id', 'recipe_ingredients.recipe')
        .leftJoin('ingredients', 'recipe_ingredients.ingredient', 'ingredients.id')
        .leftJoin('ingredient_tags', 'ingredients.id', 'ingredient_tags.ingredient')
        .leftJoin('units', 'ingredients.units', 'units.id')
        .leftJoin('recipe_seasonings', 'recipes.id', 'recipe_seasonings.recipe')
        .leftJoin('seasonings', 'recipe_seasonings.seasoning', 'seasonings.id')
        .leftJoin('recipe_tags', 'recipes.id', 'recipe_tags.recipe')
        .leftJoin('tags as r_tags', 'r_tags.id', 'recipe_tags.tag')
        .leftJoin('tags as s_tags', 's_tags.id', 'step_tags.tag')
        .leftJoin('tags as i_tags', 'i_tags.id', 'ingredient_tags.tag');
}

function getRecipeSelectQuery(db) {
    return getRecipeJoinQuery(db)
        .select(...getSelectQueries('recipes', PREFIX.RECIPES, recipesFetchFields.recipes),
            ...getSelectQueries('steps', PREFIX.STEPS, recipesFetchFields.steps),
            ...getSelectQueries('step_tags', PREFIX.STEP_TAGS, recipesFetchFields.stepTags),
            ...getSelectQueries('recipe_ingredients', PREFIX.RECIPE_INGREDIENTS, recipesFetchFields.recipeIngredients),
            ...getSelectQueries('ingredients', PREFIX.INGREDIENTS, recipesFetchFields.ingredients),
            ...getSelectQueries('units', PREFIX.UNITS, recipesFetchFields.units),
            ...getSelectQueries('ingredient_tags', PREFIX.INGREDIENT_TAGS, recipesFetchFields.ingredientTags),
            ...getSelectQueries('seasonings', PREFIX.SEASONINGS, recipesFetchFields.seasonings),
            ...getSelectQueries('recipe_seasonings', PREFIX.RECIPE_SEASONINGS, recipesFetchFields.recipeSeasonings),
            ...getSelectQueries('recipe_tags', PREFIX.RECIPE_TAGS, recipesFetchFields.recipeTags),
            ...getSelectQueries('r_tags', PREFIX.R_TAGS, recipesFetchFields.tags),
            ...getSelectQueries('s_tags', PREFIX.S_TAGS, recipesFetchFields.tags),
            ...getSelectQueries('i_tags', PREFIX.I_TAGS, recipesFetchFields.tags));
}

function getMealPlanJoinQuery(db) {
    return getRecipeJoinQuery(db
        .leftJoin('meal_plan_ingredients', 'meal_plans.id', 'meal_plan_ingredients.meal_plan')
        .leftJoin('ingredients AS ' + PREFIX.MEAL_PLAN_INGREDIENT, 'meal_plan_ingredients.ingredient', PREFIX.MEAL_PLAN_INGREDIENT + '.id')
        .leftJoin('recipe_meal_plans', 'meal_plans.id', 'recipe_meal_plans.meal_plan')
        .leftJoin('recipes', 'recipe_meal_plans.recipe', 'recipes.id'));
}

function getMealPlanSelectQuery(db) {
    return getMealPlanJoinQuery(db)
        .select(...getSelectQueries('meal_plans', PREFIX.MEAL_PLANS, mealPlanFetchFields.mealPlans),
            ...getSelectQueries('meal_plan_ingredients', PREFIX.MEAL_PLAN_INGREDIENT_RELATION, mealPlanFetchFields.ingredientMealPlans),
            ...getSelectQueries(PREFIX.MEAL_PLAN_INGREDIENT, PREFIX.MEAL_PLAN_INGREDIENT, mealPlanFetchFields.ingredientsForMealPlan),
            ...getSelectQueries('recipe_meal_plans', PREFIX.MEAL_PLAN_RECIPE, mealPlanFetchFields.recipeMealPlans),
            ...getSelectQueries('recipes', PREFIX.RECIPES, mealPlanFetchFields.recipes),
            ...getSelectQueries('steps', PREFIX.STEPS, mealPlanFetchFields.steps),
            ...getSelectQueries('step_tags', PREFIX.STEP_TAGS, mealPlanFetchFields.stepTags),
            ...getSelectQueries('recipe_ingredients', PREFIX.RECIPE_INGREDIENTS, mealPlanFetchFields.recipeIngredients),
            ...getSelectQueries('ingredients', PREFIX.INGREDIENTS, mealPlanFetchFields.ingredients),
            ...getSelectQueries('units', PREFIX.UNITS, mealPlanFetchFields.units),
            ...getSelectQueries('ingredient_tags', PREFIX.INGREDIENT_TAGS, mealPlanFetchFields.ingredientTags),
            ...getSelectQueries('seasonings', PREFIX.SEASONINGS, mealPlanFetchFields.seasonings),
            ...getSelectQueries('recipe_seasonings', PREFIX.RECIPE_SEASONINGS, mealPlanFetchFields.recipeSeasonings),
            ...getSelectQueries('recipe_tags', PREFIX.RECIPE_TAGS, mealPlanFetchFields.recipeTags),
            ...getSelectQueries('r_tags', PREFIX.R_TAGS, mealPlanFetchFields.tags),
            ...getSelectQueries('s_tags', PREFIX.S_TAGS, mealPlanFetchFields.tags),
            ...getSelectQueries('i_tags', PREFIX.I_TAGS, mealPlanFetchFields.tags));
}


module.exports = {
    getSelectQueries,
    ingredientsFetchFields,
    seasoningsFetchFields,
    userAdminFetchFields,
    recipesFetchFields,
    handleRemoveIdArrs,
    getUpdateQueries,
    getRecipeSelectQuery,
    getMealPlanSelectQuery
};