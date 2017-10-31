
exports.up = function(knex) {
  return knex.schema
    .alterTable('meal_plan_emails', function(table) {
        table.dateTime('date_to_send');
    })
};

exports.down = function(knex) {
    return knex.schema
        .alterTable('meal_plan_emails', function(table) {
            table.dropColumns('date_to_send');
        });
};
