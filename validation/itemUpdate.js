const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = validateListCreate = data => {
    const errors = {};

    data.quantity = !isEmpty(data.quantity) ? data.quantity : '';

    if (
        Validator.isEmpty(data.quantity) ||
        !Validator.isNumeric(data.quantity)
    ) {
        errors.quantity = 'Please enter a number';
    }

    if (Validator.isNumeric(data.quantity) && Number(data.quantity) <= 0) {
        errors.quantity = 'Please enter a number greater than 0';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
