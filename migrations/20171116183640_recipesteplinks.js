
exports.up = function(knex) {
    return knex.schema
        .alterTable('recipes', function(table) {
            table.string('main_link_url');
        })
        .alterTable('steps', function(table) {
            table.string('main_link_url');
        });
};

exports.down = function(knex) {
    return knex.schema
        .alterTable('recipes', function(table) {
            table.dropColumn('main_link_url');
        })
        .alterTable('steps', function(table) {
            table.dropColumn('steps');
        });
};
