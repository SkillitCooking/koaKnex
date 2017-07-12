'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const humps = require('humps');

const {cannotAuthenticate, validateClient} = require('../lib/validation');
const {ValidationError} = require('../lib/errors');
const {generateJWTForUser} = require('../lib/auth');

module.exports = {

    async get (ctx) {
        ctx.body = {message: 'yo'}
    },

    async balls (ctx) {
        ctx.throw(400, 'uh oh', {but: 'not really'});
        ctx.body = {message: 'siiiit'};
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
        //set id
        user.id = uuid();
        //hash password
        user.password = await bcrypt.hash(user.password, 10);
        //DB insertion + key decamelization
        //check for existence first...
        user.id = await ctx.app.db('users')
            .returning('id')
            .insert(humps.decamelizeKeys(user))[0];
        //get user a token - can we expect there to be an id field here? I'm not so sure if not added explicitly
        user = generateJWTForUser(user);
        //respond
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

            user = generateJWTForUser(user);

            ctx.body = {user: _.omit(user, ['password'])};
        }
    }

};