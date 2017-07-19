exports.up = function(knex) {
    return knex.schema
        .table('composing_ingredients', function(table) {
            table.boolean('is_optional').defaultTo(false);
        });
};

exports.down = function(knex) {
    return knex.schema
        .table('composing_ingredients', function(table) {
            table.dropColumn('is_optional');
        });
};
