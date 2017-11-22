
exports.up = function(knex) {
    return knex.schema
        .createTable('meal_plan_ingredients', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('meal_plan').notNullable().references('meal_plans.id').onDelete('CASCASDE');
            table.uuid('ingredient').notNullable().references('ingredients.id').onDelete('CASCADE');
            table.unique(['meal_plan', 'ingredient']);
            table.timestamps(true, true);
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('meal_plan_ingredients');
};
