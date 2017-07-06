const bcrypt = require('bcrypt');
const faker = require('faker');
const config = require('../config');

const users = [
  {
    username: faker.random.word(),
    id: faker.random.uuid(),
    isAdmin: true
  },
  {
    username: faker.random.word(),
    id: faker.random.uuid(),
    isAdmin: false
  },
  {
    username: faker.random.word(),
    id: faker.random.uuid(),
    isAdmin: false
  }
];

function getUsers() {
  return users.map(user => {
    return {
      id: user.id,
      username: user.username,
      password: bcrypt.hashSync('X12345677789', 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_admin: user.isAdmin
    }
  });
}

exports.getUsers = getUsers;

exports.seed = async function(knex) {
  if(config.env.isProd) {
    //some specialized deletion based upon something or another
    //prod env specific
  } else {
    await knex('users').del();
  }

  return knex('users').insert(getUsers());
};
