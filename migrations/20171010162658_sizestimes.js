'use strict';

exports.up = function(knex) {
    return knex.schema
        .alterTable('ingredients', function(table) {
            table.float('est_unit_price');
            table.float('total_size');
        })
        .alterTable('recipes', function(table) {
            table.integer('total_time');
            table.integer('active_time');
        });
};

exports.down = function(knex) {
    return knex.schema
        .alterTable('ingredients', function(table) {
            table.dropColumns(
                //change unit_price to total_price
                //rename columns in DB
                'est_unit_price',
                'total_size'
            );
        })
        .alterTable('recipes', function(table) {
            table.dropColumns(
                'total_time',
                'active_time'
            );
        });
};


//Using ingredient names/types as tags - eg tag bag of broccoli with "Broccoli"