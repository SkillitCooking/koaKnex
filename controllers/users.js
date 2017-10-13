'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const joinJs = require('join-js').default;
const bcrypt = require('bcrypt');
const humps = require('humps');
const isUUID = require('validator/lib/isUUID');
const errors = require('../lib/errors');

const {cannotAuthenticate, validateClient} = require('../lib/validation');
const {ValidationError} = require('../lib/errors');
const {generateJWTForUser} = require('../lib/auth');
const {getSelectQueries, userAdminFetchFields} = require('../lib/queries');
const {PREFIX} = require('../lib/constants');
const relationsMap = require('../relations-map').adminUsersMap;

function getUserObjForUpdate(user) {
    //take out delivery preferences
    //flatten address
    if(user.address) {
        user.address_street = user.address.street;
        user.address_street2 = user.address.street2;
        user.address_city = user.address.city;
        user.address_state = user.address_state;
        user.address_zip = user.address_zip;
    }
    return _.omit(user, ['address', 'deliveryPreferences']);
}

function assignAddressObject(user) {
    user.address = {
        street: user.address_street,
        street2: user.address_street2,
        city: user.address_city,
        state: user.address_state,
        zip: user.address_zip
    };
}

module.exports = {
    //TODO: add in pagination here...
    async get (ctx) {
        let users = await ctx.app.db('users')
            .leftJoin('delivery_preferences', 'users.id', 'delivery_preferences.user')
            .select(...getSelectQueries('users', PREFIX.USERS, userAdminFetchFields.users),
                ...getSelectQueries('delivery_preferences', PREFIX.DELIVERY_PREFERENCES, userAdminFetchFields.deliveryPreferences));
        users = joinJs.map(users, relationsMap, 'userMap', PREFIX.USERS + '_');
        users = users.map(user => {
            assignAddressObject(user);
            return _.omitBy(user, (val, prop) => {
                return prop === 'password' || /^address_/.test(prop);
            });
        });
        ctx.body = {users: users};
    },

    async getOne(ctx) {
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError);
        }
        let user = await ctx.app.db('users')
            .leftJoin('delivery_preferences', 'users.id', 'delivery_preferences.user')
            .select(...getSelectQueries('users', PREFIX.USERS, userAdminFetchFields.users),
                ...getSelectQueries('delivery_preferences', PREFIX.DELIVERY_PREFERENCES, userAdminFetchFields.deliveryPreferences))
            .where('users.id', id);
        user = joinJs.mapOne(user, relationsMap, 'userMap', PREFIX.USERS + '_');
        assignAddressObject(user);
        user = _.omitBy(user, (val, prop) => {
            return prop === 'password' || /^address_/.test(prop);
        });
        ctx.body = {user: user};
    },

    async balls (ctx) {
        //ctx.throw(400, 'uh oh', {but: 'not really'});
        console.log('here boose', ctx.req.body);
        ctx.body = {message: 'siiiick brah'};
    },

    async post (ctx) {
        const {body} = ctx.request;
        //get user from body
        let {user = {}} = body;
        const validationOpts = {
            abortEarly: false,
            context: {validatePassword: true}
        };
        //validate user
        user = await ctx.app.schemas.users.validate(user, validationOpts);
        //need to convert address
        user.id = uuid();
        //hash password
        user.password = await bcrypt.hash(user.password, 10);
        let newUser = _.omit(user, ['address']);
        newUser.addressStreet = user.address.street;
        if(user.address.street2) {
            newUser.addressStreet2 = user.address.street2;
        }
        newUser.addressCity = user.address.city;
        newUser.addressState = user.address.state;
        newUser.addressZip = user.address.zip;
        user.isAdmin = false;
        let deliveryPreferences = user.deliveryPreferences;
        await ctx.app.db('users')
            .insert(humps.decamelizeKeys(_.omit(newUser, 'deliveryPreferences')));
        //set delivery preferences
        if(deliveryPreferences) {
            deliveryPreferences.id = uuid();
            deliveryPreferences.user = user.id;
            await ctx.app.db('delivery_preferences')
                .insert(humps.decamelizeKeys(deliveryPreferences));
        }
        let retUser = await ctx.app.db('users')
            .leftJoin('delivery_preferences', 'users.id', 'delivery_preferences.user')
            .select(...getSelectQueries('users', PREFIX.USERS, userAdminFetchFields.users),
                ...getSelectQueries('delivery_preferences', PREFIX.DELIVERY_PREFERENCES, userAdminFetchFields.deliveryPreferences))
            .where('users.id', user.id);
        retUser = joinJs.mapOne(retUser, relationsMap, 'userMap', PREFIX.USERS + '_');
        assignAddressObject(retUser);
        retUser = generateJWTForUser(retUser);
        ctx.body = {user: _.omitBy(retUser, (val, prop) => {
            return prop === 'password' || /^address_/.test(prop);
        })};
    },

    async adminPut(ctx) {
        const {id} = ctx.params;
        const {body} = ctx.request;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError);
        }
        let {user = {}} = body;
        if(!_.isEmpty(user)) {
            const validationOpts = {
                abortEarly: false,
                context: { isUpdate: true }
            };
            user = await ctx.app.schemas.users.validate(user, validationOpts);
            if(user.deliveryPreferences) {
                await ctx.app.db('delivery_preferences')
                    .where('id', user.deliveryPreferences.id)
                    .update(humps.decamelizeKeys(user.deliveryPreferences));
            }
            if(user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
            let updateUser = getUserObjForUpdate(user);
            updateUser.updatedAt = new Date().toISOString();
            await ctx.app.db('users').where('id', id)
                .update(humps.decamelizeKeys(updateUser));
        }
        let retUser = await ctx.app.db('users')
            .leftJoin('delivery_preferences', 'users.id', 'delivery_preferences.user')
            .select(...getSelectQueries('users', PREFIX.USERS, userAdminFetchFields.users),
                ...getSelectQueries('delivery_preferences', PREFIX.DELIVERY_PREFERENCES, userAdminFetchFields.deliveryPreferences))
            .where('users.id', id);
        retUser = joinJs.mapOne(retUser, relationsMap, 'userMap', PREFIX.USERS + '_');
        assignAddressObject(retUser);
        retUser = generateJWTForUser(retUser);
        ctx.body = {user: _.omitBy(retUser, (val, prop) => {
            return prop === 'password' || /^address_/.test(prop);
        })};
    },

    async del(ctx) {
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('need an id with that DELETE homes'));
        }
        const data = await ctx.app.db('users').where('id', id).returning(['id', 'email', 'username']).del();
        ctx.body = {data: humps.camelizeKeys(data)};
    },

    async addAdmin(ctx) {
        const {body} = ctx.request;
        let {user = {}} = body;
        const validationOpts = {
            abortEarly: false,
            context: {validatePassword: true}
        };
        //validate
        user = await ctx.app.schemas.users.validate(user, validationOpts);
        user.isAdmin = true;
        user.id = uuid();
        user.password = await bcrypt.hash(user.password, 10);
        await ctx.app.db('users')
            .insert(humps.decamelizeKeys(user));
        user = generateJWTForUser(user);
        ctx.body = {user: _.omit(user, ['password'])};
    },

    async authenticate(ctx) {
        const {body} = ctx.request;

        let clientPassword = ctx.headers['client-password'];

        if(!body.user) {
            if(validateClient(clientPassword)) {
                //then generate client jwt and send
                ctx.body = generateJWTForUser({isClient: true});
            } else {
                //then generate public jwt and send
                ctx.body = generateJWTForUser({});
            }
        } else {
            if(cannotAuthenticate(body.user)) {
                ctx.throw(
                    422,
                    new ValidationError(['is invalid'], '', 'username or password')
                )
            }

            let user = await ctx.app.db('users')
                .first()
                .where({username: body.user.username});

            if(!user) {
                ctx.throw(
                    422,
                    new ValidationError(['is invalid', '', 'username or password'])
                );
            }

            const isValid = await bcrypt.compare(body.user.password, user.password);

            if(!isValid) {
                ctx.throw(
                    body.user.password,
                    422,
                    new ValidationError(['is invalid'], '', 'username or password')
                );
            }

            user = generateJWTForUser(humps.camelizeKeys(user));

            ctx.body = {user: _.omit(user, ['password'])};
        }
    }

};