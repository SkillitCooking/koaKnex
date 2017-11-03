'use strict';

const propWithPrefix = (prefixToUse) => {
    return ((prefix, prop) => {
        return {name: prop, column: prefix + '_' + prop};
    }).bind(null, prefixToUse);
};

const updateStepsCmpFn = function (stepA, stepB) {
    let isANegative = stepA.oldOrder - stepA.order < 0;
    let isBNegative = stepB.oldOrder - stepB.order < 0;
    if(isANegative && isBNegative) {
        //then put highest order first
        return stepA.order > stepB.order ? -1 : 1;
    }
    if(!isANegative && !isBNegative) {
        //then put lowest order first
        return stepA.order < stepB.order ? -1 : 1;
    }
    if(isANegative && !isBNegative) {
        //just sort towards the negative...
        //though beyond group ordering doesn't actually matter..
        return -1;
    }
    if(!isANegative && isBNegative) {
        return 1;
    }
};

const moduleAvailable = function(name) {
    try {
        require.resolve(name);
        return true;
    } catch(e) {}
    return false;
};

module.exports = {
    propWithPrefix,
    updateStepsCmpFn,
    moduleAvailable
};
