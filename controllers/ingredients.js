'use strict';

const humps = require('humps');
const uuid = require('uuid');
const _ = require('lodash');
const joinJs = require('join-js').default;

const {getSelectQueries, ingredientsGetFields} = require('../lib/queries');
const {PREFIX} = require('../lib/constants');
const  {relationsMap} = require('../lib/relations-map');

module.exports = {
    async post(ctx) {
        const {body} = ctx.request;
        //validate ingredient
        let {ingredient = {}} = body;
        const validationOpts = {
            abortEarly: false
        };
        console.log('ingredient', ingredient);
        ingredient = await ctx.app.schemas.ingredients.validate(ingredient, validationOpts);
        ingredient.id = uuid();

        //input, get id
        let sanitizedIngredient = _.omit(ingredient, ['tags', 'category', 'composingIngredients']);
        await ctx.app.db('ingredients')
            .insert(humps.decamelizeKeys(sanitizedIngredient));
        //check is composite, do relation table insertions
        if(ingredient.isComposite && ingredient.composingIngredients) {
            let composites = ingredient.composingIngredients.map(composing => ({
                id: uuid(),
                parent: ingredient.id,
                child: composing[0],
                is_optional: composing[1]
            }));
            //insert
            await ctx.app.db('composing_ingredients').insert(composites);
        }
        //insert category relation - tagID
        let categoryRelation = {
            id: uuid(),
            ingredient: ingredient.id,
            tag: ingredient.category,
            type: 'CATEGORY'
        };
        //consolidate the two DB calls below?
        await ctx.app.db('ingredient_tags').insert(categoryRelation);
        if(ingredient.tags) {
            //assuming all have type 'default' for now...
            let tags = ingredient.tags.map(tagId => ({
                id: uuid(),
                ingredient: ingredient.id,
                tag: tagId
            }));
            //insert
            await ctx.app.db('ingredient_tags').insert(tags);
        }
        ctx.body = {data: ingredient};
    },

    //make more sophisticated later? Pagination, specific key projection
    async get(ctx) {
        let ingredients = await ctx.app.db('ingredients')
            .leftJoin('ingredient_tags', 'ingredients.id', 'ingredient_tags.ingredient')
            .leftJoin('tags', 'ingredient_tags.tag', 'tags.id')
            .leftJoin('units', 'ingredients.units', 'units.id')
            .leftJoin('composing_ingredients', 'ingredients.id', 'composing_ingredients.parent')
            .leftJoin('ingredients as child_ingredients', 'composing_ingredients.child', 'child_ingredients.id')
            .select(...getSelectQueries('ingredients', PREFIX.INGREDIENTS, ingredientsGetFields.ingredients),
                ...getSelectQueries('ingredient_tags', PREFIX.INGREDIENT_TAGS, ingredientsGetFields.ingredientTags),
                ...getSelectQueries('tags', PREFIX.TAGS, ingredientsGetFields.tags),
                ...getSelectQueries('units', PREFIX.UNITS, ingredientsGetFields.units),
                ...getSelectQueries('composing_ingredients', PREFIX.COMPOSING_INGREDIENTS, ingredientsGetFields.composingIngredients),
                ...getSelectQueries('child_ingredients', PREFIX.CHILD_INGREDIENTS, ingredientsGetFields.childIngredients));
        ingredients = joinJs.map(ingredients, relationsMap, 'ingredientMap', PREFIX.INGREDIENTS + '_');
        ctx.body = {data: ingredients};
    },

    async put(ctx) {
        //pay attn wrt ingredient_tag duplication
    }
};