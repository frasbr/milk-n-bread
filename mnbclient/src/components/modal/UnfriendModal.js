import React, { Component } from 'react';
import { connect } from 'react-redux';

import { closeModal } from '../../actions/modalActions';
import { removeFriend } from '../../actions/friendActions';

class UnfriendModal extends Component {
    onSubmit = e => {
        e.preventDefault();
        this.props.removeFriend(this.props.friend);
        this.props.closeModal();
    };

    preventModalClose = e => {
        e.stopPropagation();
    };

    render() {
        return (
            <div className="modal-container" onClick={this.preventModalClose}>
                <div className="form-container">
                    <div className="top-bar">
                        <div className="form-title" />
                        <div
                            className="close-modal-button"
                            onClick={this.props.closeModal}
                        >
                            <img src="/icons/close.svg" alt="close" />
                        </div>
                    </div>
                    <form onSubmit={this.onSubmit} noValidate method="post">
                        <div className="confirm-message">
                            Are you sure you want to remove this friend?
                        </div>
                        <input
                            className="submit-button"
                            type="submit"
                            value="Confirm"
                        />
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { closeModal, removeFriend }
)(UnfriendModal);
