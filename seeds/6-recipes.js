const faker = require('faker');
const config = require('../config');

const ingredientIds = require('./5-ingredients').getIngredients().map(i => i.id);
const seasoningIds = require('./2-seasonings').getSeasonings().map(s => s.id);
const tagIds = require('./4-tags').getTags().map(t => t.id);

const recipes = [
  {
    id: faker.random.uuid(),
    title: faker.random.word(),
    description: faker.random.words(),
    mainImageUrl: faker.image.imageUrl(),
    ingredients: ingredientIds.map(i => ({
      ingredient: i,
      isFrozen: faker.random.boolean(),
      proportion: faker.random.number(0, 10)
    })),
    seasonings: seasoningIds.slice(0, faker.random.number(seasoningIds.length - 1)),
    tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
    steps: [
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 1
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 2
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 3
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 4
      }
    ]
  },
  {
    id: faker.random.uuid(),
    title: faker.random.word(),
    description: faker.random.words(),
    mainImageUrl: faker.image.imageUrl(),
    ingredients: ingredientIds.map(i => ({
      ingredient: i,
      isFrozen: faker.random.boolean(),
      proportion: faker.random.number(0, 10)
    })),
    seasonings: seasoningIds.slice(0, faker.random.number(seasoningIds.length - 1)),
    tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
    steps: [
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 1
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 2
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 3
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 4
      }
    ]
  },
  {
    id: faker.random.uuid(),
    title: faker.random.word(),
    description: faker.random.words(),
    mainImageUrl: faker.image.imageUrl(),
    ingredients: ingredientIds.map(i => ({
      ingredient: i,
      isFrozen: faker.random.boolean(),
      proportion: faker.random.number(0, 10)
    })),
    seasonings: seasoningIds.slice(0, faker.random.number(seasoningIds.length - 1)),
    tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
    steps: [
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 1
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 2
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 3
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 4
      }
    ]
  },
  {
    id: faker.random.uuid(),
    title: faker.random.word(),
    description: faker.random.words(),
    mainImageUrl: faker.image.imageUrl(),
    ingredients: ingredientIds.map(i => ({
      ingredient: i,
      isFrozen: faker.random.boolean(),
      proportion: faker.random.number(0, 10)
    })),
    seasonings: seasoningIds.slice(0, faker.random.number(seasoningIds.length - 1)),
    tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
    steps: [
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 1
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 2
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 3
      },
      {
        id: faker.random.uuid(),
        text: faker.random.words(10),
        tags: tagIds.slice(0, faker.random.number(tagIds.length - 1)),
        order: 4
      }
    ]
  }
];

function getRecipes() {
  return recipes.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    main_image_url: r.mainImageUrl
  }));
}

function getRecipeIngredients() {
  return recipes.map(r => {
    return r.ingredients.map(i => ({
      id: faker.random.uuid(),
      ingredient: i.ingredient,
      is_frozen: i.isFrozen,
      proportion: i.proportion,
      recipe: r.id
    }));
  }).reduce((accumulator, currentValue) => {
    accumulator.push(...currentValue);
    return accumulator;
  }, []);
}

function getSteps() {
  return recipes.map(r => {
    return r.steps.map(s => ({
      id: s.id,
      recipe: r.id,
      text: s.text,
      order: s.order
    }))
  }).reduce((accumulator, currentValue) => {
    accumulator.push(...currentValue);
    return accumulator;
  }, [])
}

function getStepTags() {
  let stepTags = [];
  recipes.forEach(r => {
    r.steps.forEach(s => {
      s.tags.forEach(t => {
        stepTags.push({
          id: faker.random.uuid(),
          tag: t,
          step: s.id
        });
      });
    });
  });
  return stepTags;
}

function getRecipeSeasonings() {
  let recipeSeasonings = [];
  recipes.forEach(r => {
    r.seasonings.forEach(s => {
      recipeSeasonings.push({
        id: faker.random.uuid(),
        seasoning: s,
        recipe: r.id
      });
    });
  });
  return recipeSeasonings;
}

function getRecipeTags() {
  let recipeTags = [];
  recipes.forEach(r => {
    r.tags.forEach(t => {
      recipeTags.push({
        id: faker.random.uuid(),
        tag: t,
        recipe: r.id
      });
    });
  });
}

exports.getRecipes = getRecipes;

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  if(!config.env.isProd) {
    return knex('recipes').del()
    .then(function () {
      // Inserts seed entries
      return knex('recipes').insert(getRecipes()).then(() => {
        return Promise.all([
          knex('recipe_ingredients').insert(getRecipeIngredients()),
          knex('steps').insert(getSteps()).then(() => {
            return knex('step_tags').insert(getStepTags());
          }),
          knex('recipe_seasonings').insert(getRecipeSeasonings()),
          knex('recipe_tags').insert(getRecipeTags())
        ]);
      });
    });
  }
};
