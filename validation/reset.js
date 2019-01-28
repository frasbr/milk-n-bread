const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = validatePasswordResetInput = data => {
    const errors = {};

    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if (Validator.isEmpty(data.password)) {
        errors.password = 'Please enter a password';
    } else if (!Validator.isLength(data.password, { min: 8, max: 100 })) {
        errors.password = 'Password must be at least 8 characters';
    }

    if (Validator.isEmpty(data.password2)) {
        errors.password2 = 'Please confirm password';
    } else if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = 'Passwords do not match';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
