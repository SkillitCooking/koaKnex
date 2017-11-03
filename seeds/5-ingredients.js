const faker = require('faker');
const config = require('../config');

const units = [...require('./3-units').getUnits().map(u => u.id)];
const tags = [...require('./4-tags').getTags()];

const ingredients = [
    {
        id: faker.random.uuid(),
        nameSingular: faker.random.word(),
        namePlural: faker.random.word(),
        estUnitPrice: faker.random.number({min: 1, max: 15}),
        totalSize: faker.random.number(1, 4),
        isComposite: false,
        servingSize: 1,
        description: faker.random.words(10),
        units: units[faker.random.number({min: 0, max: units.length - 1})],
        category: tags[0],
        tags: tags.slice(1, faker.random.number(tags.length))
    },
    {
        id: faker.random.uuid(),
        nameSingular: faker.random.word(),
        namePlural: faker.random.word(),
        estUnitPrice: faker.random.number(1, 15),
        totalSize: faker.random.number(1, 4),
        isComposite: false,
        servingSize: 1,
        description: faker.random.words(10),
        units: units[faker.random.number({min: 0, max: units.length - 1})],
        category: tags[0],
        tags: tags.slice(1, faker.random.number(tags.length))
    },
    {
        id: faker.random.uuid(),
        nameSingular: faker.random.word(),
        namePlural: faker.random.word(),
        estUnitPrice: faker.random.number({min: 1, max: 15}),
        totalSize: faker.random.number({min: 1, max: 4}),
        isComposite: false,
        servingSize: 1,
        description: faker.random.words(10),
        units: units[faker.random.number({min: 0, max: units.length - 1})],
        category: tags[0],
        tags: tags.slice(1, faker.random.number(tags.length))
    }
];

function getIngredients() {
    return ingredients.map(i => ({
        id: i.id,
        name_singular: i.nameSingular,
        name_plural: i.namePlural,
        est_unit_price: i.estUnitPrice,
        total_size: i.totalSize,
        is_composite: i.isComposite,
        serving_size: i.servingSize,
        description: i.description,
        units: i.units
    }));
}

function getIngredientTags() {
    let ingredientTags = [];
    ingredients.forEach(i => {
        ingredientTags.push({
            id: faker.random.uuid(),
            ingredient: i.id,
            tag: i.category.id
        });
        ingredientTags.push(...i.tags.map(t => ({
            id: faker.random.uuid(),
            ingredient: i.id,
            tag: t.id
        })));
    });
    return ingredientTags;
}

exports.getIngredients = getIngredients;

exports.seed = function(knex) {
    // Deletes ALL existing entries
    if(!config.env.isProd) {
        return knex('ingredients').del()
            .then(function () {
                // Inserts seed entries
                return knex('ingredients').insert(getIngredients()).then(() => {
                    return knex('ingredient_tags').insert(getIngredientTags());
                });
            });
    }
};
