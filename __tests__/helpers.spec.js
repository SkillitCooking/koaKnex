'use strict';

const helpers = require('../lib/helpers');

test('updateStepsCmp', () => {
    let steps = [
        {order: 14, oldOrder: 15},
        {order: 4, oldOrder: 5},
        {order: 13, oldOrder: 11},
        {order: 11, oldOrder: 10},
        {order: 8, oldOrder: 7},
        {order: 3, oldOrder: 2},
        {order: 2, oldOrder: 1}
    ];
    steps.sort(helpers.updateStepsCmpFn);
    expect(steps).toEqual([
        { order: 13, oldOrder: 11 },
        { order: 11, oldOrder: 10 },
        { order: 8, oldOrder: 7 },
        { order: 3, oldOrder: 2 },
        { order: 2, oldOrder: 1 },
        { order: 4, oldOrder: 5 },
        { order: 14, oldOrder: 15 }
    ]);
});