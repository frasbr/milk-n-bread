const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = validateRegisterInput = data => {
    const errors = {};

    data.username = !isEmpty(data.username) ? data.username : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if (Validator.isEmpty(data.username)) {
        errors.username = 'Username is required';
    } else if (!Validator.isLength(data.username, { min: 3, max: 30 })) {
        errors.username =
            'Please enter a username with length between 3 and 30 characters';
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = 'Email address is required';
    } else if (!Validator.isEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password is required';
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
