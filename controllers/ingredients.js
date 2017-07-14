'use strict';

const humps = require('humps');
const uuid = require('uuid');
const _ = require('lodash');

module.exports = {
    async post(ctx) {
        const {body} = ctx.request;
        //validate ingredient
        let {ingredient = {}} = body;
        const validationOpts = {
            abortEarly: false
        };
        ingredient = await ctx.app.schemas.ingredients.validate(ingredient, validationOpts);
        ingredient.id = uuid();
        //input, get id
        await ctx.app.db('ingredients')
            .insert(humps.decamelizeKeys(ingredient));
        //check is composite, do relation table insertions
        if(ingredient.isComposite && ingredient.composingIngredients) {
            let composites = ingredient.composingIngredients.map(composingId => ({
                id: uuid(),
                parent: ingredient.id,
                child: composingId
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
    }
};