'use strict';

const propWithPrefix = (prefixToUse) => {
    return ((prefix, prop) => {
        return {name: prop, column: prefix + '_' + prop}
    }).bind(null, prefixToUse);
}

module.exports = {
    propWithPrefix
};