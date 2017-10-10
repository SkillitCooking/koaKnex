'use strict';

exports.up = function(knex) {
    return knex.schema
        .createTable('meal_plans', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('user').notNullable().references('users.id').onDelete('CASCADE');
            table.dateTime('delivery_time').notNullable();
            table.string('title');
            table.string('overview');
            table.timestamps(true, true);
        })
        .createTable('delivery_preferences', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('user').notNullable().references('users.id').onDelete('CASCADE');
            table.integer('meals_per_week').notNullable();
            table.integer('min_deliveries_per_week').notNullable();
            table.integer('max_deliveries_per_week').notNullable();
            table.integer('servings_per_meal').notNullable();
            table.timestamps(true, true);
        })
        .createTable('recipe_meal_plans', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('recipe').notNullable().references('recipes.id').onDelete('CASCADE');
            table.uuid('meal_plan').notNullable().references('meal_plans.id').onDelete('CASCADE');
            table.unique(['recipe', 'meal_plan']);
            table.timestamps(true, true);
        })
        .alterTable('users', function(table) {
            table.string('first_name').notNullable().defaultTo('DEFAULT');
            table.string('last_name').notNullable().defaultTo('DEFAULT');
            table.string('address_street').notNullable().defaultTo('DEFAULT');
            table.string('address_street2');
            table.string('address_city').notNullable().defaultTo('DEFAULT');
            table.string('address_state').notNullable().defaultTo('DEFAULT');
            table.string('address_zip').notNullable().defaultTo('DEFAULT');
            table.integer('age');
            table.string('gender');
            table.boolean('is_due_for_meal_plan').defaultTo(false);
            table.uuid('previous_meal_plan').references('meal_plans.id');
        })
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('meal_plans')
        .dropTableIfExists('delivery_preferences')
        .dropTableIfExists('recipe_meal_plans')
        .alterTable('users', function(table) {
            table.dropColumns(
                'first_name',
                'last_name',
                'address_street',
                'address_street2',
                'address_city',
                'address_state',
                'address_zip',
                'age',
                'gender',
                'is_due_for_meal_plan',
                'previous_meal_plan'
            );
        });
};
