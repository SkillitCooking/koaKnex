
exports.up = function(knex) {
    return knex.schema
        .alterTable('ingredients', function(table) {
            table.renameColumn('est_unit_price', 'est_total_price');
        });
};

exports.down = function(knex) {
    return knex.schema
        .alterTable('ingredients', function(table) {
            table.renameColumn('est_total_price', 'est_unit_price');
        });
};
