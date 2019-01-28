const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = validateForgotInput = data => {
    const errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';

    if (Validator.isEmpty(data.email)) {
        errors.email = 'Please enter your email address';
    } else if (!Validator.isEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
