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
        TAGS: 't',
        UNITS: 'u',
        RECIPES: 'r',
        SEASONINGS: 's',
        COMPOSING_SEASONINGS: 'cs',
        STEPS: 'st',
        STEP_TAGS: 'stt',
        RECIPE_INGREDIENTS: 'ri',
        RECIPE_SEASONINGS: 'rs'
    }
});