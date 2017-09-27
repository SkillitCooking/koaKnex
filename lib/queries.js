'use strict';

function getSelectQueries(table, prefix, fields) {
    return fields.map((field) => {
        return table + '.' + field + ' as ' + prefix + '_' + field;
    });
}

const ingredientsFetchFields = {
    ingredients: ['id', 'name_singular', 'name_plural', 'description', 'is_composite', 'serving_size'],
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
    recipes: ['id', 'title', 'description', 'main_image_url'],
    steps: ['id', 'text', 'order'],
    tags: ['id', 'name'],
    stepTags: ['id'],
    ingredients: ['id', 'name_singular', 'name_plural', 'description', 'serving_size', 'is_composite'],
    units: ['id', 'name_singular', 'name_plural', 'abbreviation'],
    ingredientTags: ['id'],
    recipeIngredients: ['id', 'is_frozen', 'proportion'],
    seasonings: ['id', 'name', 'is_composite'],
    recipeSeasonings: ['id'],
    recipeTags: ['id']
}

module.exports = {
    getSelectQueries,
    ingredientsFetchFields,
    seasoningsFetchFields,
    userAdminFetchFields,
    recipesFetchFields
};