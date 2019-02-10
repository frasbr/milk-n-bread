import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { registerUser } from '../../actions/authActions';

import InputGroup from '../common/InputGroup';

class Register extends Component {
    constructor() {
        super();
        this.state = {
            username: '',
            email: '',
            password: '',
            password2: '',
            errors: {}
        };
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();

        const user = {
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            password2: this.state.password2
        };

        this.props.registerUser(user, this.props.history);
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) {
            this.setState({ errors: nextProps.errors });
        }
    }

    render() {
        const { errors } = this.state;

        return (
            <div className="wrapper">
                <div className="container">
                    <div className="form-container auth-form">
                        <div className="form-title">Register</div>
                        <form
                            method="post"
                            action="/api/users/register"
                            onSubmit={this.onSubmit}
                        >
                            <InputGroup
                                type="text"
                                name="username"
                                value={this.state.username}
                                label="Username"
                                onChange={this.onChange}
                                error={errors.username}
                            />
                            <InputGroup
                                type="text"
                                name="email"
                                value={this.state.email}
                                label="Email"
                                onChange={this.onChange}
                                error={errors.email}
                            />
                            <InputGroup
                                type="password"
                                name="password"
                                value={this.state.password}
                                label="Password"
                                onChange={this.onChange}
                                error={errors.password}
                            />
                            <InputGroup
                                type="password"
                                name="password2"
                                value={this.state.password2}
                                label="Confirm password"
                                onChange={this.onChange}
                                error={errors.password2}
                            />
                            <input
                                className="submit-button"
                                type="submit"
                                value="Sign up"
                            />
                        </form>
                    </div>
                    <div className="centered-text">
                        <p>Already have an account?</p>
                        <Link to="/login">
                            <div className="auth-form-cta">Log in</div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { registerUser }
)(withRouter(Register));
