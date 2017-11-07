'use strict';

const humps = require('humps');
const uuid = require('uuid');
const _ = require('lodash');
const joinJs = require('join-js').default;
const isUUID = require('validator/lib/isUUID');

const {getSelectQueries, ingredientsFetchFields} = require('../lib/queries');
const {PREFIX} = require('../lib/constants');
const relationsMap = require('../relations-map').ingredientsMap;
const errors = require('../lib/errors');

const Ingredient = require('../objects/ingredient.js');

module.exports = {
    async post(ctx) {
        const {body} = ctx.request;
        //validate ingredient
        let {ingredient = {}} = body;
        const validationOpts = {
            abortEarly: false,
            context: {isUpdate: false}
        };
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
        if(ingredient.tags && ingredient.tags.length > 0) {
            //assuming all have type 'default' for now...
            let tags = ingredient.tags.map(tagId => ({
                id: uuid(),
                ingredient: ingredient.id,
                tag: tagId
            }));
            //insert
            await ctx.app.db('ingredient_tags').insert(tags);
        }
        let retIngredient = await ctx.app.db('ingredients')
            .leftJoin('ingredient_tags', 'ingredients.id', 'ingredient_tags.ingredient')
            .leftJoin('tags', 'ingredient_tags.tag', 'tags.id')
            .leftJoin('units', 'ingredients.units', 'units.id')
            .leftJoin('composing_ingredients', 'ingredients.id', 'composing_ingredients.parent')
            .leftJoin('ingredients as child_ingredients', 'composing_ingredients.child', 'child_ingredients.id')
            .select(...getSelectQueries('ingredients', PREFIX.INGREDIENTS, ingredientsFetchFields.ingredients),
                ...getSelectQueries('ingredient_tags', PREFIX.INGREDIENT_TAGS, ingredientsFetchFields.ingredientTags),
                ...getSelectQueries('tags', PREFIX.TAGS, ingredientsFetchFields.tags),
                ...getSelectQueries('units', PREFIX.UNITS, ingredientsFetchFields.units),
                ...getSelectQueries('composing_ingredients', PREFIX.COMPOSING_INGREDIENTS, ingredientsFetchFields.composingIngredients),
                ...getSelectQueries('child_ingredients', PREFIX.CHILD_INGREDIENTS, ingredientsFetchFields.childIngredients))
            .whereIn('ingredients.id', [ingredient.id]);
        retIngredient = joinJs.mapOne(retIngredient, relationsMap, 'ingredientMap', PREFIX.INGREDIENTS + '_');
        ctx.body = {data: retIngredient};
    },

    //make more sophisticated later? Pagination, specific key projection
    async get(ctx) {
        const {body} = ctx.request;
        let {ids = []} = body;
        let query = ctx.app.db('ingredients')
            .leftJoin('ingredient_tags', 'ingredients.id', 'ingredient_tags.ingredient')
            .leftJoin('tags', 'ingredient_tags.tag', 'tags.id')
            .leftJoin('units', 'ingredients.units', 'units.id')
            .leftJoin('composing_ingredients', 'ingredients.id', 'composing_ingredients.parent')
            .leftJoin('ingredients as child_ingredients', 'composing_ingredients.child', 'child_ingredients.id')
            .select(...getSelectQueries('ingredients', PREFIX.INGREDIENTS, ingredientsFetchFields.ingredients),
                ...getSelectQueries('ingredient_tags', PREFIX.INGREDIENT_TAGS, ingredientsFetchFields.ingredientTags),
                ...getSelectQueries('tags', PREFIX.TAGS, ingredientsFetchFields.tags),
                ...getSelectQueries('units', PREFIX.UNITS, ingredientsFetchFields.units),
                ...getSelectQueries('composing_ingredients', PREFIX.COMPOSING_INGREDIENTS, ingredientsFetchFields.composingIngredients),
                ...getSelectQueries('child_ingredients', PREFIX.CHILD_INGREDIENTS, ingredientsFetchFields.childIngredients));
        if(ids.length > 0) {
            query.whereIn('ingredients.id', ids);
        }
        let ingredients = await query;
        ingredients = joinJs.map(ingredients, relationsMap, 'ingredientMap', PREFIX.INGREDIENTS + '_');
        ctx.body = {data: ingredients};
    },

    async put(ctx) {
        //pay attn wrt ingredient_tag duplication
        //expecting everything sent in the ingredient body object to be new...
        const {body} = ctx.request;
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Need an id with that PUT, dawg'));
        }
        let {ingredient = {}, composingToRemove = [], composingToEdit = [], tagsToRemove = []} = body;
        let queries = [];
        if(composingToEdit.length > 0) {
            composingToEdit.forEach(ci => {
                queries.push(ctx.app.db('composing_ingredients')
                    .where('id', ci.id)
                    .update(humps.decamelizeKeys(ci)));
            });
        }
        if(!_.isEmpty(ingredient)) {
            let validationOpts = {
                abortEarly: true,
                context: {isUpdate: true}
            };
            ingredient = await ctx.app.schemas.ingredients.validate(ingredient, validationOpts);
            //decamelize
            let updateIngredient = _.omit(ingredient, ['category', 'tags', 'composingIngredients']);
            updateIngredient.updatedAt = new Date().toISOString();
            queries.push(ctx.app.db('ingredients')
                .where('id', id)
                .update(humps.decamelizeKeys(updateIngredient)));
        }
        if(ingredient.category) {
            let categoryRelation = {
                id: uuid(),
                ingredient: id,
                tag: ingredient.category,
                type: 'CATEGORY'
            };
            queries.push(ctx.app.db('ingredient_tags').insert(categoryRelation));
        }
        if(ingredient.tags && ingredient.tags.length > 0) {
            //assumes default type...
            let tagRelations = ingredient.tags.map(tag => ({
                id: uuid(),
                tag: tag,
                ingredient: id
            }));
            queries.push(ctx.app.db('ingredient_tags').insert(tagRelations));
        }
        if(ingredient.composingIngredients && ingredient.composingIngredients.length > 0) {
            let composites = ingredient.composingIngredients.map(composing => ({
                id: uuid(),
                parent: id,
                child: composing[0],
                is_optional: composing[1]
            }));
            queries.push(ctx.app.db('composing_ingredients').insert(composites));
        }
        if(composingToRemove.length > 0) {
            queries.push(ctx.app.db('composing_ingredients').whereIn('id', composingToRemove).del())
        }
        if(tagsToRemove.length > 0) {
            queries.push(ctx.app.db('ingredient_tags').whereIn('id', tagsToRemove).del())
        }
        let queryRes = await Promise.all(queries);
        let retIngredient = await ctx.app.db('ingredients')
            .leftJoin('ingredient_tags', 'ingredients.id', 'ingredient_tags.ingredient')
            .leftJoin('tags', 'ingredient_tags.tag', 'tags.id')
            .leftJoin('units', 'ingredients.units', 'units.id')
            .leftJoin('composing_ingredients', 'ingredients.id', 'composing_ingredients.parent')
            .leftJoin('ingredients as child_ingredients', 'composing_ingredients.child', 'child_ingredients.id')
            .select(...getSelectQueries('ingredients', PREFIX.INGREDIENTS, ingredientsFetchFields.ingredients),
                ...getSelectQueries('ingredient_tags', PREFIX.INGREDIENT_TAGS, ingredientsFetchFields.ingredientTags),
                ...getSelectQueries('tags', PREFIX.TAGS, ingredientsFetchFields.tags),
                ...getSelectQueries('units', PREFIX.UNITS, ingredientsFetchFields.units),
                ...getSelectQueries('composing_ingredients', PREFIX.COMPOSING_INGREDIENTS, ingredientsFetchFields.composingIngredients),
                ...getSelectQueries('child_ingredients', PREFIX.CHILD_INGREDIENTS, ingredientsFetchFields.childIngredients))
            .where('ingredients.id', id);
        retIngredient = joinJs.mapOne(retIngredient, relationsMap, 'ingredientMap', PREFIX.INGREDIENTS + '_');
        ctx.body = {data: retIngredient};
    },

    async del(ctx) {
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Need an id with that DELETE, dawg'));
        }
        const data = await ctx.app.db('ingredients').where('id', id).returning(['id', 'store_keeping_name', 'name_singular']).del();
        ctx.body = {data: humps.camelizeKeys(data)};
    }
};