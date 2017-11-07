
exports.up = function(knex) {
    return knex.schema
        .alterTable('ingredients', function(table) {
            //drop name_singular unique constraint, add store_keeping_name_uniq
            table.dropUnique('name_singular');
            table.string('store_keeping_name').unique();
        });
};

exports.down = function(knex) {
    return knex.schema
        .alterTable('products', function(table) {
            table.unique('name_singular');
            table.dropColumns('store_keeping_name');
        });
};
