'use strict';
exports.up = function(knex) {
    return knex.schema
    //is the below unique constrain going to be a problem
    //wrt updates?
        .alterTable('steps', function(table) {
            table.unique(['recipe', 'order']);
        })
        .createTable('recipe_tags', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('recipe').notNullable().references('recipes.id').onDelete('CASCADE');
            table.uuid('tag').notNullable().references('tags.id').onDelete('CASCADE');
            table.unique(['recipe', 'tag']);
            table.timestamps(true, true);
        });
};

exports.down = function(knex) {
    return knex.schema
        .alterTable('steps', function(table) {
            table.dropUnique(['recipe', 'order']);
        })
        .dropTableIfExists('recipe_tags');
};
