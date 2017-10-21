
exports.up = function(knex) {
  return knex.schema
    .alterTable('meal_plans', function(table) {
        table.string('delivery_timezone').notNullable();
    })
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('meal_plans', function(table) {
        table.dropColumns('delivery_timezone');
    });
};
