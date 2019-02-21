const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = validateListCreate = data => {
    const errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';
    data.quantity = !isEmpty(data.quantity) ? data.quantity : '';

    if (Validator.isEmpty(data.name)) {
        errors.name = 'Please enter a name';
    } else if (!Validator.isLength(data.name, { max: 180 })) {
        errors.name = 'Item names must be less than 180 characters';
    }

    if (
        !isEmpty(data.description) &&
        !Validator.isLength(data.description, { max: 240 })
    ) {
        errors.description =
            'List description must be less than 240 characters';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
