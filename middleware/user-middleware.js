'use strict';

const {has} = require('lodash');

/**
 * cases: (on scopes)
 * admin: id, isAdmin
 * logged-in: id
 * client: isClient
 * public: 
 */

module.exports = async (ctx, next) => {

    if(has(ctx, 'state.jwtData.sub.id')){
        //then token went through and retrieved token with id
        ctx.state.user = await ctx.app.db('users')
            .first(
                'id',
                'username',
                'email',
                'created_at',
                'updated_at'
            )
            .where({id: ctx.state.jwtData.sub.id});
    }
    return next();
};