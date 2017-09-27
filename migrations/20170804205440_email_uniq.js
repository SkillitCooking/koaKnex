'use strict';

exports.up = function(knex) {
  return knex.schema
    .alterTable('users', function(table) {
        //table.string('email').notNullable().unique().alter();
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('users', function(table) {
        //table.string('email').notNullable().defaultTo('demo@demo.demo').alter();
    });
};
