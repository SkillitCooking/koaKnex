'use strict';

class Ingredient {
    constructor(props) {
        this.id = props.id;
        this.nameSingular = props.nameSingular;
        this.namePlural = props.namePlural;
        this.description = props.description;
        this.isComposite = props.isComposite;
        this.servingSize = props.servingSize;
        this.units = props.units;
        this.category = props.category;
        this.tags = props.tags;
        this.composingIngredients = props.composingIngredients;
    }
}

module.exports = Ingredient;