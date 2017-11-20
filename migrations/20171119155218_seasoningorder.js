
exports.up = function(knex) {
    knex.schema.alterTable('recipe_seasonings', function(table) {
        table.integer('present_order');
    });
};

exports.down = function(knex) {
    knex.schema.alterTable('recipe_seasonings', function(table) {
        table.dropColumn('present_order');
    });
};
