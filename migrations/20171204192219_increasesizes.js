
exports.up = function(knex) {
    return knex.schema
        .alterTable('ingredients', function(table) {
            table.string('description', 1000).alter();
            table.string('store_keeping_name', 400).alter();
        })
        .alterTable('recipes', function(table) {
            table.string('description', 1200).alter();
        })
        .alterTable('steps', function(table) {
            table.string('text', 1000).alter();
        })
        .alterTable('meal_plans', function(table) {
            table.string('title', 300).alter();
            table.string('overview', 1200).alter();
        });
};

exports.down = function(knex) {
    return knex.schema;
};
