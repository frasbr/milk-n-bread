import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import InputGroup from '../common/InputGroup';
import { connect } from 'react-redux';

import { loginUser } from '../../actions/authActions';

class Login extends Component {
    constructor() {
        super();
        this.state = {
            username: '',
            password: '',
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
            password: this.state.password
        };

        this.props.loginUser(user);
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
            this.props.history.push('/dashboard');
        }

        if (nextProps.errors) {
            this.setState({ errors: nextProps.errors });
        }
    }

    componentDidMount() {
        if (this.props.auth.isAuthenticated) {
            this.props.history.push('/dashboard');
        }
    }

    render() {
        const { errors } = this.state;
        return (
            <div className="wrapper">
                <div className="container">
                    <div className="form-container auth-form">
                        <div className="form-title">Login</div>
                        <form
                            method="post"
                            action="/api/users/login"
                            onSubmit={this.onSubmit}
                        >
                            <InputGroup
                                type="text"
                                name="username"
                                label="Username"
                                onChange={this.onChange}
                                error={errors.username}
                            />
                            <InputGroup
                                type="password"
                                name="password"
                                label="Password"
                                onChange={this.onChange}
                                error={errors.password}
                            />
                            <input
                                className="submit-button"
                                type="submit"
                                value="Log in"
                            />
                        </form>
                    </div>
                    <div className="centered-text">
                        <p>Don't have an account?</p>
                        <Link to="/register">
                            <div className="auth-form-cta">Sign up</div>
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
    { loginUser }
)(Login);
