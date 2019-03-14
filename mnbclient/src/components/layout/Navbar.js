import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';

class Navbar extends Component {
    constructor() {
        super();
        this.state = {
            pathname: ''
        };
    }

    componentWillMount() {
        this.setState({ pathname: this.props.nav.location });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.nav.location) {
            this.setState({ pathname: nextProps.nav.location });
        }
    }

    render() {
        if (!this.props.auth.isAuthenticated) {
            return (
                <nav className="nav nav-main">
                    <Link to="/" className="nav-home">
                        <div className="logo">
                            <img src="/logo.svg" alt="Milk 'n' bread logo" />
                        </div>
                    </Link>
                </nav>
            );
        }
        const isFriendsOpen =
            this.state.pathname === '/dashboard/friends' ||
            this.state.pathname === '/dashboard/options';
        return (
            <nav className="nav nav-main">
                <Link to="/" className="nav-home logged-in">
                    <div className="greeting-text">
                        Hi, {this.props.auth.user.username}
                    </div>
                </Link>
                <Link to="/dashboard">
                    <div
                        className={classnames('nav-icon', {
                            'nav-active': !isFriendsOpen
                        })}
                    >
                        <img
                            src="/icons/list.svg"
                            className="list-icon"
                            alt="Lists"
                        />
                    </div>
                </Link>
                <Link to="/dashboard/friends">
                    <div
                        className={classnames('nav-icon', {
                            'nav-active': isFriendsOpen
                        })}
                    >
                        <img src="/icons/friends.svg" alt="Friends" />
                    </div>
                </Link>
            </nav>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    nav: state.nav
});

export default connect(
    mapStateToProps,
    {}
)(withRouter(Navbar));
