const faker = require('faker');
const config = require('../config');

const tags = [
  {
    name: faker.random.word(),
    id: faker.random.uuid()
  },
  {
    name: faker.random.word(),
    id: faker.random.uuid()
  },
  {
    name: faker.random.word(),
    id: faker.random.uuid()
  }
];

function getTags() {
  return tags.map(tag => ({
    name: tag.name,
    id: tag.id
  }));
}

exports.getTags = getTags;

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  if(!config.env.isProd) {
    return knex('tags').del()
    .then(function () {
      // Inserts seed entries
      return knex('tags').insert(getTags());
    });
  }
};
