'use strict';

require('dotenv').config();
const ctrl = require('../controllers').users
const errors = require('../lib/errors');
const bcrypt = require('bcrypt');

const hash = bcrypt.hashSync('12345678', 10);

const schemas = require('../schemas');

const mockThrow = jest.fn();
mockThrow.mockImplementation(() => {
    throw new errors.ValidationError();
})
const db = jest.fn();
const first = jest.fn();
const where = jest.fn();
const returning = jest.fn();
const insert = jest.fn();
insert.mockImplementation(() => {
    return ['xxx'];
});
returning.mockImplementation(() => {
    return {insert: insert};
});
where.mockImplementation((user) => {
    if(user.username === 'good') {
        return {
            username: 'good',
            password: hash
        };
    }
    return null;
});
first.mockImplementation(() => {
    return {where: where};
});
db.mockImplementation(() => {
    return {
        first: first,
        returning: returning
    };
});

//Authenticate tests
// no user AND no client-password => expect token to have value
test('/users/authenticate no user, no client password header', async () => {
    let ctx = {
        request: {
            body: {}
        },
        headers: {
            'client-password': process.env.CLIENT_PASSWORD
        }
    };
    await ctrl.authenticate(ctx);
    expect(ctx.body).toHaveProperty('token');
});
// no user AND client password => expect isClient and token to have value
test('/users/authenticate no user with client password header', async () => {
    let ctx = {
        request: {
            body: {}
        },
        headers: {
            'client-password': process.env.CLIENT_PASSWORD
        }
    };
    await ctrl.authenticate(ctx);
    expect(ctx.body).toHaveProperty('token');
    expect(ctx.body.isClient).toBe(true);
});
// bad user
test('/users/authenticate bad user', async () => {
    let ctx = {
        request: {
            body: {
                user: {username: 'uhoh'}
            }
        },
        headers: {
            'client-password': process.env.CLIENT_PASSWORD
        },
        throw: mockThrow
    };
    try {
        await ctrl.authenticate(ctx);
    } catch(e) {
        expect(e).toBeInstanceOf(errors.ValidationError);
    }
});
// no user
test('/users/authenticate no user', async () => {
    let ctx = {
        request: {
            body: {
                user: {username: 'uhoh', password: '12345678'}
            }
        },
        app: {
            db: db
        },
        headers: {
            'client-password': process.env.CLIENT_PASSWORD
        },
        throw: mockThrow
    };
    try {
        await ctrl.authenticate(ctx);
    } catch(e) {
        expect(e).toBeInstanceOf(errors.ValidationError);
    }
});
// valid user
test('/users/authenticate valid user', async () => {
    let ctx = {
        request: {
            body: {
                user: {username: 'good', password: '12345678'}
            }
        },
        app: {
            db: db
        },
        headers: {
            'client-password': process.env.CLIENT_PASSWORD
        },
        throw: mockThrow
    }
    await ctrl.authenticate(ctx);
    //try/catch on above
    expect(ctx.body).toHaveProperty('user');
    expect(ctx.body.user).toHaveProperty('token');
    expect(ctx.body.user.username).toBe('good');
});

//Post tests
// invalid user
test('post /users/ invalid user', async () => {
    let ctx = {
        request: {
            body: {
                user: {
                    username: 'adsf'
                }
            }
        },
        app: {}
    };
    schemas(ctx.app);
    try {
        await ctrl.post(ctx);
    } catch(e) {
        expect(e).toBeInstanceOf(errors.ValidationError);
    }
});
// valid user
test('post /users/ valid user', async () => {
    let ctx = {
        request: {
            body: {
                user: {
                    username: 'adsf',
                    email: 'email@email.email',
                    password: '2345678787'
                }
            }
        },
        app: {db: db}
    };
    schemas(ctx.app);
    await ctrl.post(ctx);
    expect(ctx.body).toHaveProperty('user');
    expect(ctx.body.user).toHaveProperty('token');
    expect(ctx.body.user.username).toBe('adsf');
    expect(ctx.body.user.id).toBe('xxx');
});