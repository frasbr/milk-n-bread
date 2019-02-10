import React, { Component } from 'react';

import { Link } from 'react-router-dom';

export default class Landing extends Component {
    render() {
        return (
            <div className="wrapper">
                <div className="container">
                    <div className="centered-text landing">
                        <Link to="/login">
                            <div className="auth-form-cta">Login</div>
                        </Link>
                    </div>
                    <div className="centered-text landing">
                        <Link to="/register">
                            <div className="auth-form-cta">Register</div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
