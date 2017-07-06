'use strict';

exports.up = function(knex) {
    return knex.schema

        .createTable('users', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.string('username').unique().notNullable();
            table.string('email').notNullable().defaultTo('demo@demo.demo');
            table.string('password').notNullable();
            table.boolean('is_admin').notNullable().defaultTo(false);
            table.timestamps(true, true);
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('users');
};