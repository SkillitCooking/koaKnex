'use strict';

module.exports = Object.freeze({
    AUTHORIZATION: {
        PUBLIC: 1,
        CLIENT: 2,
        PRIVATE: 3,
        LOGGED_IN: 4
    },
    PREFIX: {
        INGREDIENTS: 'i',
        INGREDIENT_TAGS: 'it',
        COMPOSING_INGREDIENTS: 'ci',
        CHILD_INGREDIENTS: 'chi',
        TAGS: 't',
        UNITS: 'u',
        RECIPES: 'r',
        SEASONINGS: 's',
        COMPOSING_SEASONINGS: 'cs',
        CHILD_SEASONINGS: 'chs',
        STEPS: 'st',
        STEP_TAGS: 'stt',
        RECIPE_INGREDIENTS: 'ri',
        RECIPE_SEASONINGS: 'rs',
        RECIPE_TAGS: 'rt',
        R_TAGS: 'rtag',
        S_TAGS: 'stag',
        I_TAGS: 'itag'
    },
    MAP_IDS: {
        RECIPES: 'recipesMap',
        RECIPE_TAGS: 'recipeTagsMap',
        INGREDIENTS: 'ingredientMap',
        SEASONINGS: 'seasoningsMap',
        UNITS: 'unitsMap',
        TAG: 'tagMap',
        CHILD_INGREDIENT: 'childIngredientMap',
        CHILD_SEASONING: 'childSeasoningMap',
        STEPS: 'stepsMap',
        STEP_TAGS: 'stepTagsMap',
        INGREDIENT_TAGS: 'ingredientTagsMap'
    }
});