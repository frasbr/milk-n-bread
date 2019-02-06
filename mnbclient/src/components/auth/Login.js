import React, { Component } from 'react';

import InputGroup from '../common/InputGroup';

export default class Login extends Component {
    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();
    };

    render() {
        return (
            <div className="wrapper">
                <div className="container">
                    <div className="form-container auth-form">
                        <div className="form-title">Login</div>
                        <form
                            method="post"
                            action="/api/users/login"
                            submit={this.onSubmit}
                        >
                            <InputGroup
                                type="text"
                                name="username"
                                label="Username"
                                onChange={this.onChange}
                            />
                            <InputGroup
                                type="password"
                                name="password"
                                label="Password"
                                onChange={this.onChange}
                            />
                            <input
                                className="login-button"
                                type="submit"
                                value="Sign in"
                            />
                        </form>
                    </div>
                    <div className="centered-text">
                        <p>Don't have an account?</p>
                        <a href="/register">
                            <div className="signup-cta">Sign up</div>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
