const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = validateLoginInput = data => {
    const errors = {};

    data.username = !isEmpty(data.username) ? data.username : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (Validator.isEmpty(data.username)) {
        errors.username = 'Please enter a username';
    } else if (!Validator.isLength(data.username, { max: 30 })) {
        errors.username = 'Lets be reasonable here';
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = 'Please enter a password';
    } else if (!Validator.isLength(data.password, { max: 100 })) {
        errors.password = 'Lets be reasonable here';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
