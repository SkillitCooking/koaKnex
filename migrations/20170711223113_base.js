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
        })

        .createTable('units', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.string('name_singular').unique().notNullable();
            table.string('name_plural').notNullable();
            table.timestamps(true, true);
        })

        .createTable('ingredients', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.string('name_singular').unique().notNullable();
            table.string('name_plural').notNullable();
            table.string('description');
            table.boolean('is_composite').defaultTo(false);
            table.float('serving_size').defaultTo(1);
            table.uuid('units').notNullable().references('units.id').onDelete('CASCADE');
            table.timestamps(true, true);           
        })

        .createTable('composing_ingredients', function(table) {
            table.uuid('id').unique().primary().notNullable();
            //constraint where parents must have 'is_composite' set?
            table.uuid('parent').notNullable().references('ingredients.id').onDelete('CASCADE');
            table.uuid('child').notNullable().references('ingredients.id').onDelete('CASCADE');
            table.timestamps(true, true);
        })

        .createTable('recipes', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.string('title').unique().notNullable();
            table.string('description').notNullable();
            table.string('main_image_url').notNullable();
            table.timestamps(true, true);            
        })

        .createTable('tags', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.string('name').unique().notNullable();
            table.timestamps(true, true);
        })

        .createTable('seasonings', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.string('name').unique().notNullable();
            table.boolean('is_composite').defaultTo(false);
            table.timestamps(true, true);
        })

        .createTable('composite_seasonings', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('parent').notNullable().references('seasonings.id').onDelete('CASCADE');
            table.uuid('child').notNullable().references('seasonings.id').onDelete('CASCADE');
            table.timestamps(true, true);
        })

        .createTable('ingredient_tags', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('ingredient').notNullable().references('ingredients.id').onDelete('CASCADE');
            table.uuid('tag').notNullable().references('tags.id').onDelete('CASCADE');
            //will want this trimmed and lowercased... almost desires being made its own table...
            table.string('type').defaultTo('DEFAULT');
        })

        .createTable('steps', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('recipe').notNullable().references('recipes.id').onDelete('CASCADE');
            table.string('text').notNullable();
            table.integer('order').notNullable();
        })

        .createTable('step_tags', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('step').notNullable().references('steps.id').onDelete('CASCADE');
            table.uuid('tag').notNullable().references('tags.id').onDelete('CASCADE');
        })

        .createTable('recipe_ingredients', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('recipe').notNullable().references('recipes.id').onDelete('CASCADE');
            table.uuid('ingredient').notNullable().references('ingredients.id').onDelete('CASCADE');
            table.boolean('is_frozen').defaultTo(false);
            table.float('proportion').defaultTo(1);
        })

        .createTable('recipe_seasonings', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('recipe').notNullable().references('recipes.id').onDelete('CASCADE');
            table.uuid('seasoning').notNullable().references('seasonings.id').onDelete('CASCADE');
        })
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('users');
};