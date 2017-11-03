const bcrypt = require('bcrypt');
const faker = require('faker');
const config = require('../config');

const users = [
    {
        username: 'Dane',
        id: faker.random.uuid(),
        isAdmin: true,
        email: faker.internet.email(),
        address: {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            zip: faker.address.zipCode()
        },
        gender: 'M',
        deliveryPreferences: {
            mealsPerWeek: faker.random.number({min: 1, max: 4}),
            minDeliveriesPerWeek: faker.random.number({min: 1, max: 4}),
            maxDeliveriesPerWeek: faker.random.number({min: 1, max: 4}),
            servingsPerMeal: faker.random.number({min: 1, max: 4})
        }
    },
    {
        username: faker.random.word(),
        id: faker.random.uuid(),
        isAdmin: false,
        email: faker.internet.email(),
        address: {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            zip: faker.address.zipCode()
        },
        gender: 'M',
        deliveryPreferences: {
            mealsPerWeek: faker.random.number({min: 1, max: 4}),
            minDeliveriesPerWeek: faker.random.number({min: 1, max: 4}),
            maxDeliveriesPerWeek: faker.random.number({min: 1, max: 4}),
            servingsPerMeal: faker.random.number({min: 1, max: 4})
        }
    },
    {
        username: faker.random.word(),
        id: faker.random.uuid(),
        isAdmin: false,
        email: faker.internet.email(),
        address: {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            zip: faker.address.zipCode()
        },
        gender: 'M',
        deliveryPreferences: {
            mealsPerWeek: faker.random.number({min: 1, max: 4}),
            minDeliveriesPerWeek: faker.random.number({min: 1, max: 4}),
            maxDeliveriesPerWeek: faker.random.number({min: 1, max: 4}),
            servingsPerMeal: faker.random.number({min: 1, max: 4})
        }
    }
];

function getUsers() {
    return users.map(user => {

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            gender: user.gender,
            address_street: user.address.street,
            address_city: user.address.city,
            address_state: user.address.state,
            address_zip: user.address.zip,
            password: bcrypt.hashSync('X12345677789', 10),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_admin: user.isAdmin
        };
    });
}

function getDeliveryPreferences() {
    return users.map(user => ({
        id: faker.random.uuid(),
        user: user.id,
        meals_per_week: user.deliveryPreferences.mealsPerWeek,
        min_deliveries_per_week: user.deliveryPreferences.minDeliveriesPerWeek,
        max_deliveries_per_week: user.deliveryPreferences.maxDeliveriesPerWeek,
        servings_per_meal: user.deliveryPreferences.servingsPerMeal
    }));
}

exports.getUsers = getUsers;

exports.seed = async function(knex) {
    if(config.env.isProd) {
    //some specialized deletion based upon something or another
    //prod env specific
    } else {
        await knex('users').del();
        return knex('users').insert(getUsers()).then(() => {
            return knex('delivery_preferences').insert(getDeliveryPreferences());
        });
    }
};
