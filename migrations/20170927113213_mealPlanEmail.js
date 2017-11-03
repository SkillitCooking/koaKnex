
exports.up = function(knex) {
    return knex.schema
        .createTable('meal_plan_email_types', function(table) {
            table.string('type').unique().primary().notNullable();
        })
        .createTable('meal_plan_emails', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('meal_plan').notNullable().references('meal_plans.id').onDelete('CASCADE');
            table.boolean('has_sent').defaultTo(false);
            table.dateTime('date_sent');
            table.string('email_type').references('meal_plan_email_types.type').notNullable().onUpdate('CASCADE');
            table.timestamps(true, true);
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('meal_plan_email_types')
        .dropTableIfExists('meal_plan_emails');
};
