'use strict';

exports.up = function(knex) {
    return knex.schema

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
            table.unique(['parent', 'child']);
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

        .createTable('composing_seasonings', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('parent').notNullable().references('seasonings.id').onDelete('CASCADE');
            table.uuid('child').notNullable().references('seasonings.id').onDelete('CASCADE');
            table.timestamps(true, true);
            table.unique(['parent', 'child']);
        })

        .createTable('ingredient_tags', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('ingredient').notNullable().references('ingredients.id').onDelete('CASCADE');
            table.uuid('tag').notNullable().references('tags.id').onDelete('CASCADE');
            //will want this trimmed and lowercased... almost desires being made its own table...
            //purpose for concept like 'CATEGORY'
            table.string('type').defaultTo('DEFAULT');
            table.timestamps(true, true);
            table.unique(['ingredient', 'tag']);
        })

        .createTable('steps', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('recipe').notNullable().references('recipes.id').onDelete('CASCADE');
            table.string('text').notNullable();
            table.integer('order').notNullable();
            table.timestamps(true, true);
        })

        .createTable('step_tags', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('step').notNullable().references('steps.id').onDelete('CASCADE');
            table.uuid('tag').notNullable().references('tags.id').onDelete('CASCADE');
            table.unique(['step', 'tag']);
            table.timestamps(true, true);
        })

        .createTable('recipe_ingredients', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('recipe').notNullable().references('recipes.id').onDelete('CASCADE');
            table.uuid('ingredient').notNullable().references('ingredients.id').onDelete('CASCADE');
            table.boolean('is_frozen').defaultTo(false);
            table.float('proportion').defaultTo(1);
            table.unique(['recipe', 'ingredient']);
            table.timestamps(true, true);
        })

        .createTable('recipe_seasonings', function(table) {
            table.uuid('id').unique().primary().notNullable();
            table.uuid('recipe').notNullable().references('recipes.id').onDelete('CASCADE');
            table.uuid('seasoning').notNullable().references('seasonings.id').onDelete('CASCADE');
            table.unique(['recipe', 'seasoning']);
            table.timestamps(true, true);
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('units')
        .dropTableIfExists('ingredients')
        .dropTableIfExists('composing_ingredients')
        .dropTableIfExists('recipes')
        .dropTableIfExists('tags')
        .dropTableIfExists('seasonings')
        .dropTableIfExists('composing_seasonings')
        .dropTableIfExists('ingredient_tags')
        .dropTableIfExists('steps')
        .dropTableIfExists('step_tags')
        .dropTableIfExists('recipe_ingredients')
        .dropTableIfExists('recipe_seasonings')
};