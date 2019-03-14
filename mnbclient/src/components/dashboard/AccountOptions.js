import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { logoutUser } from '../../actions/authActions';

class AccountOptions extends Component {
    goBack = () => {
        this.props.history.push('/dashboard/friends');
    };

    logout = () => {
        this.props.logoutUser();
    };

    render() {
        return (
            <div className="list-expanded-container">
                <div className="top-bar">
                    <div className="return-button" onClick={this.goBack}>
                        <img src="/icons/back.svg" alt="back" />
                    </div>
                </div>
                <div className="list-expanded">
                    <div className="list-info">
                        <div className="title">Options</div>
                    </div>
                    <div className="list-items">
                        <div className="list-item">
                            <div className="logout" onClick={this.logout}>
                                Logout
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(withRouter(AccountOptions));
