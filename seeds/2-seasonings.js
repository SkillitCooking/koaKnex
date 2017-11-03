const faker = require('faker');
const config = require('../config');

const seasonings = [
    {
        id: faker.random.uuid(),
        name: faker.random.word()
    },
    {
        id: faker.random.uuid(),
        name: faker.random.word()
    },
    {
        id: faker.random.uuid(),
        name: faker.random.word()
    }
];

function getSeasonings() {
    return seasonings.map(s => ({
        name: s.name,
        id: s.id
    }));
}

exports.getSeasonings = getSeasonings;

exports.seed = async function(knex) {
    if(!config.env.isProd) {
        await knex('seasonings').del();
        return knex('seasonings').insert(getSeasonings());
    }
};
