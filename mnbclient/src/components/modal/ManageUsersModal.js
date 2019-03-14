import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { removeUserFromList, clearList } from '../../actions/listActions';
import { closeModal } from '../../actions/modalActions';

class ManageUsersModal extends Component {
    constructor() {
        super();
        this.state = {
            contributors: [],
            errors: {}
        };
    }

    removeUser = user_id => {
        // Remove user from component state
        const newContributors = this.state.contributors.slice();
        const userIndex = newContributors.map(user => user.id).indexOf(user_id);
        if (userIndex >= 0) newContributors.splice(userIndex, 1);
        this.setState({ contributors: newContributors });

        // Make call to remove user from list in db
        this.props.removeUserFromList(user_id, this.props.list);

        // If removed self then clear the list from state and go back to dashboard
        if (user_id === this.props.auth.user.id) {
            this.props.clearList(this.props.list);
            this.props.closeModal();
            this.props.history.goBack();
        }
    };

    preventModalClose = e => {
        e.stopPropagation();
    };

    componentWillMount() {
        this.setState({ contributors: this.props.contributors });
    }

    render() {
        const { contributors } = this.state;
        return (
            <div className="modal-container" onClick={this.preventModalClose}>
                <div className="form-container">
                    <div className="top-bar">
                        <div className="form-title">Manage&nbsp;users</div>
                        <div
                            className="close-modal-button"
                            onClick={this.props.closeModal}
                        >
                            <img src="/icons/close.svg" alt="close" />
                        </div>
                    </div>
                    <div className="list-items">
                        {contributors.map(user => {
                            return (
                                <div className="contributor-user" key={user.id}>
                                    <div className="name">{user.username}</div>
                                    {user.id !== this.props.author && (
                                        <div
                                            className="remove-button"
                                            onClick={() =>
                                                this.removeUser(user.id)
                                            }
                                        >
                                            <img
                                                src="/icons/close.svg"
                                                alt="kick"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
    { closeModal, removeUserFromList, clearList }
)(withRouter(ManageUsersModal));
