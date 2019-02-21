import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { logoutUser } from '../../actions/authActions';
import { clearAllLists } from '../../actions/listActions';

class Navbar extends Component {
    logout = e => {
        e.preventDefault();
        this.props.clearAllLists();
        this.props.logoutUser();
    };

    render() {
        return (
            <nav className="nav nav-main">
                <Link to="/" className="nav-home">
                    <div className="logo">
                        <img src="/logo.svg" alt="Milk 'n' bread logo" />
                    </div>
                </Link>
                <div className="nav-icon">
                    <img src="/icons/list.svg" alt="Lists" />
                </div>
                <div className="nav-icon">
                    <img src="/icons/friends.svg" alt="Friends" />
                </div>
                <div className="nav-icon" onClick={this.logout}>
                    Logout
                </div>
            </nav>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logoutUser, clearAllLists }
)(Navbar);
