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

module.exports = {
    getSelectQueries,
    ingredientsFetchFields,
    seasoningsFetchFields
};