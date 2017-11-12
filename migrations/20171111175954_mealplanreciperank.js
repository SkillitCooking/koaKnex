
exports.up = function(knex) {
    return knex.schema
        .alterTable('recipe_meal_plans', function(table) {
            table.integer('order');
        });
};

exports.down = function(knex) {
    return knex.schema
        .alterTable('recipe_meal_plans', function(table) {
            table.dropColumn('order');
        });
};
