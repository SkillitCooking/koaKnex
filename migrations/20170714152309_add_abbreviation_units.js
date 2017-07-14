
exports.up = function(knex) {
    return knex.schema
        .table('units', function(table) {
            table.string('abbreviation');
        });
};

exports.down = function(knex) {
    return knex.schema
        .table('units', function(table) {
            table.dropColumn('abbreviation');
        });
};
